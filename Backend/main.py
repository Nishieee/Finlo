import multiprocessing
if __name__ == "__main__":
    multiprocessing.set_start_method('spawn', force=True)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import json
from groq import Groq
import os
from datetime import datetime, date, timedelta
from supabase import create_client, Client
from enum import Enum
from typing import List
import sys
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
#from speech_service_requests import WorkingSpeechToSQLService, speech_to_sql_simple
from fastapi import File, UploadFile, Form

load_dotenv()

app = FastAPI(title="AI SQL Generator for Daily Expenses")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import your existing BusinessForecaster class
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from business_forecasting import BusinessForecaster

# Forecasting Models
class ForecastPeriod(str, Enum):
    WEEK = "7"
    MONTH = "30" 
    QUARTER = "90"

class ForecastMetric(str, Enum):
    REVENUE = "revenue"
    EXPENSES = "expenses" 
    PROFIT = "profit"
    CASH_FLOW = "cash_flow"

class ForecastResponse(BaseModel):
    metric: str
    period_days: int
    forecast_data: List[Dict[str, Any]]
    summary: Dict[str, Any]
    business_insights: List[str]
    generated_at: str

# Initialize forecaster
forecaster = BusinessForecaster()

# Initialize clients
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
#working_speech_service = WorkingSpeechToSQLService()

class SqlRequest(BaseModel):
    input_text: str
    execute: Optional[bool] = True

class SqlResponse(BaseModel):
    input_text: str
    generated_sql: str
    sql_type: str
    executed: bool
    result: Optional[Any] = None
    error: Optional[str] = None
    explanation: str
    user_friendly_message: str
    formatted_data: Optional[Dict[str, Any]] = None


# Add these endpoints to your main.py
'''
@app.post("/speech-to-sql")
async def speech_to_sql_endpoint(
    audio: UploadFile = File(..., description="Audio file"),
    execute: bool = Form(True, description="Execute the SQL"),
    language: str = Form("en", description="Language code")
):
    """Working speech-to-SQL endpoint"""
    result = await working_speech_service.process_speech_to_sql(
        audio_file=audio,
        execute=execute,
        language=language
    )
    return result
'''
@app.post("/transcribe-only")
async def transcribe_only_endpoint(
    audio: UploadFile = File(...),
    language: str = Form("en")
):
    """Transcribe audio to text only"""
    result = await working_speech_service.transcribe_with_whisper(audio, language)
    return result

# Enhanced SQL generation with better error handling
def generate_sql_from_text(text: str) -> Dict[str, str]:
    """Generate SQL query from natural language using AI with robust error handling"""
    
    system_prompt = f"""You are an SQL generator. Generate ONLY SQL statements based on user input.

TABLE SCHEMA:
daily_expenses (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
)

CONSTRAINTS:
- category MUST be: ingredients, utilities, supplies, equipment, other
- payment_method MUST be: cash, card, bank_transfer, check
- Never include id or created_at in INSERT (auto-generated)
- Use today's date if not specified: {date.today().isoformat()}

CASH FLOW RULES:
- EXPENSES/PURCHASES/PAYMENTS = NEGATIVE amounts (money going out)
- INCOME/REVENUE/SALES = POSITIVE amounts (money coming in)

EXAMPLES:
"bought flour for $50" → INSERT INTO daily_expenses (date, amount, description, category, payment_method) VALUES ('{date.today().isoformat()}', -50.00, 'flour', 'ingredients', 'card');

"how much spent last 7 days?" → SELECT COALESCE(SUM(ABS(amount)), 0) as total_spent FROM daily_expenses WHERE date >= '{(date.today() - timedelta(days=7)).isoformat()}' AND amount < 0;

"show today expenses" → SELECT * FROM daily_expenses WHERE date = '{date.today().isoformat()}' AND amount < 0;

Return ONLY the SQL statement. No explanations."""

    try:
        response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"SQL for: {text}"}
            ],
            model="llama-3.1-8b-instant",
            temperature=0,
            max_tokens=200,
        )
        
        sql_query = response.choices[0].message.content.strip()
        
        # Clean the SQL query
        sql_query = sql_query.replace("```sql", "").replace("```", "")
        sql_query = sql_query.replace("Output:", "").replace("SQL:", "")
        sql_query = sql_query.strip()
        
        # Remove extra lines and keep first valid SQL
        lines = [line.strip() for line in sql_query.split('\n') if line.strip()]
        if lines:
            sql_query = lines[0]
        
        # Ensure semicolon
        if sql_query and not sql_query.endswith(';'):
            sql_query += ';'
        
        # Determine SQL type
        sql_type = "UNKNOWN"
        if sql_query:
            sql_upper = sql_query.upper()
            if sql_upper.startswith("INSERT"):
                sql_type = "INSERT"
            elif sql_upper.startswith("SELECT"):
                sql_type = "SELECT"
            elif sql_upper.startswith("UPDATE"):
                sql_type = "UPDATE"
            elif sql_upper.startswith("DELETE"):
                sql_type = "DELETE"
        
        print(f"Generated SQL: {sql_query}")
        print(f"SQL Type: {sql_type}")
            
        return {
            "sql": sql_query,
            "type": sql_type
        }
        
    except Exception as e:
        print(f"Error in SQL generation: {str(e)}")
        return {
            "sql": "",
            "type": "ERROR",
            "error": str(e)
        }

# Enhanced SELECT query execution with smart pattern detection
def execute_select_query(sql: str, input_text: str = "") -> Dict[str, Any]:
    """Execute SELECT query with smart pattern detection for spending queries"""
    try:
        input_lower = input_text.lower()
        print(f"🔍 Processing SELECT query for: {input_text}")
        
        # Smart pattern detection for spending queries
        if "spend" in input_lower or "spent" in input_lower:
            print("✅ Detected spending query - calculating total")
            
            # Determine the time period
            if "yesterday" in input_lower:
                target_date = (date.today() - timedelta(days=1)).isoformat()
                result = supabase.table("daily_expenses").select("amount").eq("date", target_date).lt("amount", 0).execute()
                period = "yesterday"
                
            elif "today" in input_lower:
                target_date = date.today().isoformat()
                result = supabase.table("daily_expenses").select("amount").eq("date", target_date).lt("amount", 0).execute()
                period = "today"
                
            elif "7 days" in input_lower or "week" in input_lower:
                start_date = (date.today() - timedelta(days=7)).isoformat()
                result = supabase.table("daily_expenses").select("amount").gte("date", start_date).lt("amount", 0).execute()
                period = "last 7 days"
                
            elif "30 days" in input_lower:
                start_date = (date.today() - timedelta(days=30)).isoformat()
                result = supabase.table("daily_expenses").select("amount").gte("date", start_date).lt("amount", 0).execute()
                period = "last 30 days"
                
            elif "20 days" in input_lower:
                start_date = (date.today() - timedelta(days=20)).isoformat()
                result = supabase.table("daily_expenses").select("amount").gte("date", start_date).lt("amount", 0).execute()
                period = "last 20 days"
                
            elif "month" in input_lower and "this" in input_lower:
                start_date = date.today().replace(day=1).isoformat()
                result = supabase.table("daily_expenses").select("amount").gte("date", start_date).lt("amount", 0).execute()
                period = "this month"
                
            else:
                # Default to recent expenses if no specific period
                result = supabase.table("daily_expenses").select("amount").order("date", desc=True).limit(50).lt("amount", 0).execute()
                period = "recent"
            
            # Calculate total spent (expenses are negative, so we take absolute value)
            total_spent = sum(abs(float(row["amount"])) for row in result.data)
            print(f"💰 Total spent {period}: ${total_spent}")
            
            return {
                "data": [{
                    "total_spent": total_spent,
                    "period": period,
                    "transaction_count": len(result.data)
                }],
                "executed": True,
                "user_message": f"You spent ${total_spent:.2f} {period}"
            }
        
        # Handle income queries
        elif "income" in input_lower or "revenue" in input_lower or "earned" in input_lower:
            print("✅ Detected income query")
            
            if "30 days" in input_lower:
                start_date = (date.today() - timedelta(days=30)).isoformat()
                result = supabase.table("daily_expenses").select("amount").gte("date", start_date).gt("amount", 0).execute()
                period = "last 30 days"
            elif "month" in input_lower:
                start_date = date.today().replace(day=1).isoformat()
                result = supabase.table("daily_expenses").select("amount").gte("date", start_date).gt("amount", 0).execute()
                period = "this month"
            else:
                result = supabase.table("daily_expenses").select("amount").gt("amount", 0).limit(100).execute()
                period = "recent"
            
            total_income = sum(float(row["amount"]) for row in result.data)
            
            return {
                "data": [{
                    "total_income": total_income,
                    "period": period,
                    "transaction_count": len(result.data)
                }],
                "executed": True,
                "user_message": f"Your total income {period}: ${total_income:.2f}"
            }
        
        # Default: show recent transactions
        else:
            print("❌ No specific pattern - showing recent transactions")
            result = supabase.table("daily_expenses").select("*").order("date", desc=True).limit(10).execute()
            return {
                "data": result.data,
                "executed": True,
                "user_message": f"Showing {len(result.data)} recent transactions"
            }
        
    except Exception as e:
        print(f"❌ SELECT execution error: {str(e)}")
        return {"error": f"SELECT execution error: {str(e)}", "executed": False}

# Enhanced INSERT execution
def execute_insert_query(sql: str) -> Dict[str, Any]:
    """Execute INSERT query using Supabase client"""
    try:
        import re
        
        # Extract values from INSERT statement
        values_match = re.search(r"VALUES\s*\((.*?)\)", sql, re.IGNORECASE)
        if not values_match:
            return {"error": "Could not parse INSERT values", "executed": False}
        
        values_str = values_match.group(1)
        values = []
        
        # Parse values
        current_value = ""
        in_quotes = False
        
        for char in values_str:
            if char == "'" and not in_quotes:
                in_quotes = True
            elif char == "'" and in_quotes:
                in_quotes = False
                values.append(current_value)
                current_value = ""
            elif char == "," and not in_quotes:
                if current_value.strip():
                    try:
                        values.append(float(current_value.strip()))
                    except:
                        values.append(current_value.strip())
                current_value = ""
            else:
                if in_quotes or char != " ":
                    current_value += char
        
        # Add the last value
        if current_value.strip():
            try:
                values.append(float(current_value.strip()))
            except:
                values.append(current_value.strip())
        
        # Map to column names
        if len(values) >= 5:
            expense_data = {
                "date": values[0],
                "amount": float(values[1]), 
                "description": str(values[2]),
                "category": str(values[3]),
                "payment_method": str(values[4])
            }
            
            result = supabase.table("daily_expenses").insert(expense_data).execute()
            
            # Generate confirmation message
            transaction_type = "income" if float(values[1]) > 0 else "expense"
            amount_display = f"${abs(float(values[1])):.2f}"
            
            return {
                "data": result.data,
                "executed": True,
                "user_message": f"Successfully added {transaction_type} of {amount_display} for '{values[2]}'"
            }
        else:
            return {"error": "Insufficient values for INSERT", "executed": False}
            
    except Exception as e:
        return {"error": f"INSERT execution error: {str(e)}", "executed": False}

# Main SQL execution router
def execute_sql_query(sql: str, sql_type: str, input_text: str = "") -> Dict[str, Any]:
    """Execute SQL query based on type"""
    try:
        if sql_type == "INSERT":
            return execute_insert_query(sql)
        elif sql_type == "SELECT":
            return execute_select_query(sql, input_text)
        elif sql_type in ["UPDATE", "DELETE"]:
            return {"message": "UPDATE/DELETE queries require additional confirmation", "executed": False}
        else:
            return {"error": "Unsupported SQL type", "executed": False}
            
    except Exception as e:
        return {"error": str(e), "executed": False}

def generate_explanation(input_text: str, sql: str, sql_type: str) -> str:
    """Generate human-readable explanation"""
    explanations = {
        "INSERT": f"Adding new record based on: '{input_text}'",
        "SELECT": f"Retrieving and calculating data for: '{input_text}'",
        "UPDATE": f"Modifying existing records based on: '{input_text}'", 
        "DELETE": f"Removing records based on: '{input_text}'"
    }
    return explanations.get(sql_type, f"Executing {sql_type} operation for: '{input_text}'")

# Main endpoint
@app.post("/generate-sql", response_model=SqlResponse)
async def generate_and_execute_sql(request: SqlRequest):
    """Enhanced SQL generation and execution"""
    
    try:
        # Generate SQL
        sql_result = generate_sql_from_text(request.input_text)
        
        # Handle generation errors
        if not sql_result or "error" in sql_result:
            return SqlResponse(
                input_text=request.input_text,
                generated_sql="",
                sql_type="ERROR",
                executed=False,
                result=None,
                error=sql_result.get("error", "SQL generation failed"),
                explanation="Failed to generate SQL",
                user_friendly_message="❌ I couldn't understand your request. Please try rephrasing it.",
                formatted_data={}
            )
        
        sql_query = sql_result.get("sql", "")
        sql_type = sql_result.get("type", "UNKNOWN")
        
        # Generate explanation
        explanation = generate_explanation(request.input_text, sql_query, sql_type)
        
        # Execute if requested
        execution_result = None
        executed = False
        error = None
        user_friendly_message = ""
        formatted_data = {}
        
        if request.execute and sql_type != "UNKNOWN" and sql_query.strip():
            execution_result = execute_sql_query(sql_query, sql_type, request.input_text)
            executed = execution_result.get("executed", False)
            
            if executed:
                user_message = execution_result.get("user_message", "Query executed successfully")
                user_friendly_message = f"✅ {user_message}"
                
                # Format data for response
                if execution_result.get("data"):
                    data = execution_result["data"]
                    if len(data) == 1 and isinstance(data[0], dict):
                        if "total_spent" in data[0]:
                            formatted_data = {
                                "total_amount": data[0]["total_spent"],
                                "period": data[0].get("period", ""),
                                "transaction_count": data[0].get("transaction_count", 0),
                                "type": "spending_summary"
                            }
                        elif "total_income" in data[0]:
                            formatted_data = {
                                "total_amount": data[0]["total_income"],
                                "period": data[0].get("period", ""),
                                "transaction_count": data[0].get("transaction_count", 0),
                                "type": "income_summary"
                            }
            else:
                error = execution_result.get("error", "Execution failed")
                user_friendly_message = f"❌ {error}"
                
        elif sql_type == "UNKNOWN":
            error = "Could not generate valid SQL"
            user_friendly_message = "❌ I didn't understand your request. Could you please rephrase it?"
        else:
            user_friendly_message = f"📝 Generated {sql_type} query (not executed)"
        
        return SqlResponse(
            input_text=request.input_text,
            generated_sql=sql_query,
            sql_type=sql_type,
            executed=executed,
            result=execution_result.get("data") if execution_result else None,
            error=error,
            explanation=explanation,
            user_friendly_message=user_friendly_message,
            formatted_data=formatted_data or {}
        )
        
    except Exception as e:
        print(f"❌ Main endpoint error: {str(e)}")
        return SqlResponse(
            input_text=request.input_text,
            generated_sql="",
            sql_type="ERROR",
            executed=False,
            result=None,
            error=str(e),
            explanation=f"Error processing request: {str(e)}",
            user_friendly_message=f"❌ Something went wrong: {str(e)}",
            formatted_data={}
        )

# Keep all your existing forecasting endpoints
@app.get("/forecast/comprehensive/{period}")
async def get_comprehensive_forecast(period: ForecastPeriod):
    """Get comprehensive business forecast including all metrics"""
    try:
        forecast_days = int(period.value)
        results = forecaster.run_complete_analysis(
            generate_dummy=False,
            forecast_days=forecast_days
        )
        
        if not results:
            raise HTTPException(status_code=500, detail="Unable to generate forecast")
        
        return {
            "period_days": forecast_days,
            "forecasts": results['summary'],
            "insights": results['insights'],
            "generated_at": datetime.now().isoformat(),
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comprehensive forecast error: {str(e)}")

@app.get("/forecast/{metric}/{period}", response_model=ForecastResponse)
async def get_forecast(metric: ForecastMetric, period: ForecastPeriod):
    """Generate AI forecast for specific business metric"""
    try:
        df = forecaster.fetch_data_from_supabase()
        if df is None:
            raise HTTPException(status_code=404, detail="No business data found")
        
        prepared_data = forecaster.prepare_data_for_prophet(df)
        forecast_days = int(period.value)
        
        if metric == ForecastMetric.REVENUE:
            forecast_result = forecaster.forecast_with_prophet(
                prepared_data['daily_revenue'], forecast_days, "Daily Revenue"
            )
        elif metric == ForecastMetric.EXPENSES:
            forecast_result = forecaster.forecast_with_prophet(
                prepared_data['daily_expenses'], forecast_days, "Daily Expenses"
            )
        elif metric == ForecastMetric.CASH_FLOW:
            forecast_result = forecaster.forecast_with_prophet(
                prepared_data['daily_cash_flow'], forecast_days, "Net Cash Flow"
            )
        else:  # profit
            revenue_forecast = forecaster.forecast_with_prophet(
                prepared_data['daily_revenue'], forecast_days, "Revenue"
            )
            expense_forecast = forecaster.forecast_with_prophet(
                prepared_data['daily_expenses'], forecast_days, "Expenses"
            )
            
            if revenue_forecast and expense_forecast:
                profit_forecast = revenue_forecast['forecast'].copy()
                profit_forecast['yhat'] = revenue_forecast['forecast']['yhat'] - expense_forecast['forecast']['yhat']
                forecast_result = {'forecast': profit_forecast}
            else:
                raise HTTPException(status_code=500, detail="Unable to generate profit forecast")
        
        if not forecast_result:
            raise HTTPException(status_code=500, detail="Forecasting failed - insufficient data")
        
        forecast = forecast_result['forecast']
        future_data = forecast.tail(forecast_days)
        
        forecast_data = []
        for _, row in future_data.iterrows():
            forecast_data.append({
                "date": row['ds'].strftime('%Y-%m-%d'),
                "predicted_value": round(row['yhat'], 2),
                "trend": round(row.get('trend', row['yhat']), 2)
            })
        
        summary = {
            "total_forecast": round(future_data['yhat'].sum(), 2),
            "daily_average": round(future_data['yhat'].mean(), 2),
            "trend_direction": "increasing" if future_data['yhat'].iloc[-1] > future_data['yhat'].iloc[0] else "decreasing",
            "min_day": round(future_data['yhat'].min(), 2),
            "max_day": round(future_data['yhat'].max(), 2)
        }
        
        insights = []
        if summary["trend_direction"] == "increasing":
            insights.append(f"📈 {metric.value.title()} is trending upward - great momentum!")
        else:
            insights.append(f"📉 {metric.value.title()} is declining - consider adjustments")
        
        insights.append(f"💰 Expected {period.value}-day {metric.value}: ${summary['total_forecast']:,.2f}")
        insights.append(f"📊 Daily average: ${summary['daily_average']:,.2f}")
        
        return ForecastResponse(
            metric=metric.value,
            period_days=forecast_days,
            forecast_data=forecast_data,
            summary=summary,
            business_insights=insights,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting error: {str(e)}")

@app.get("/metrics/current")
async def get_current_metrics():
    """Get current business performance metrics"""
    try:
        df = forecaster.fetch_data_from_supabase()
        if df is None:
            raise HTTPException(status_code=404, detail="No business data found")
        
        recent_data = df[df['date'] >= (df['date'].max() - timedelta(days=30))]
        
        revenue_total = recent_data[(recent_data['category'] == 'other') & (recent_data['amount'] > 0)]['amount'].sum()
        expense_conditions = (
            (recent_data['amount'] < 0) |
            ((recent_data['category'] != 'other') & (recent_data['amount'] > 0))
        )
        expense_total = recent_data[expense_conditions]['amount'].abs().sum()
        
        current_metrics = {
            "revenue_30d": round(revenue_total, 2),
            "expenses_30d": round(expense_total, 2), 
            "profit_30d": round(revenue_total - expense_total, 2),
            "profit_margin": round((revenue_total - expense_total) / revenue_total * 100, 2) if revenue_total > 0 else 0,
            "daily_avg_revenue": round(revenue_total / 30, 2),
            "daily_avg_expenses": round(expense_total / 30, 2),
            "transaction_count": len(recent_data),
            "last_updated": datetime.now().isoformat()
        }
        
        expense_data = recent_data[expense_conditions]
        category_breakdown = expense_data.groupby('category')['amount'].apply(lambda x: x.abs().sum()).round(2).to_dict()
        
        return {
            "current_metrics": current_metrics,
            "category_breakdown": category_breakdown,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metrics error: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "🚀 Fixed AI SQL Generator & Business Forecasting API",
        "description": "Natural language to SQL with smart spending calculations",
        "features": [
            "✅ Smart spending queries - get totals, not individual records",
            "💰 Handles: 'last 7 days', 'last 30 days', 'yesterday', 'today', etc.",
            "📊 User-friendly responses with clear totals",
            "🔧 Robust error handling",
            "📈 Business forecasting capabilities"
        ],
        "endpoints": {
            "sql_generation": {
                "/generate-sql": "Smart SQL generation with spending totals"
            },
            "forecasting": {
                "/forecast/{metric}/{period}": "AI forecasting",
                "/metrics/current": "Current business metrics"
            }
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fixed-ai-sql-generator"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)