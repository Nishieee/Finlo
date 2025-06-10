#using prophet for forecasting
import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
import random
from prophet import Prophet
import matplotlib.pyplot as plt
import seaborn as sns
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import warnings
warnings.filterwarnings('ignore')

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

class BusinessForecaster:
    def __init__(self):
        self.categories = ['ingredients', 'utilities', 'supplies', 'equipment', 'other']
        self.payment_methods = ['cash', 'card', 'bank_transfer', 'check']
        
    def generate_dummy_data(self, days=365):  # Increased from 90 to 365 days
        """Generate realistic business expense and revenue dummy data with seasonal patterns"""
        
        print(f"🔄 Generating {days} days of comprehensive business data...")
        
        start_date = date.today() - timedelta(days=days)
        data = []
        
        for day in range(days):
            current_date = start_date + timedelta(days=day)
            day_of_week = current_date.weekday()  # 0=Monday, 6=Sunday
            month = current_date.month
            
            # Business is closed on Sundays, reduced activity on Saturdays
            if day_of_week == 6:  # Sunday - completely closed
                continue
            
            # Seasonal multipliers for revenue (coffee shops busier in winter, slower in summer)
            seasonal_multiplier = {
                1: 1.2, 2: 1.15, 3: 1.0, 4: 0.95, 5: 0.9, 6: 0.8,  # Winter busy, summer slow
                7: 0.85, 8: 0.9, 9: 1.0, 10: 1.1, 11: 1.15, 12: 1.25  # Holiday season boost
            }[month]
            
            # Holiday effects (reduced revenue on major holidays)
            holiday_dates = [
                (1, 1), (7, 4), (11, 24), (12, 25), (12, 31)  # New Year, July 4th, Thanksgiving, Christmas, NYE
            ]
            is_holiday = (current_date.month, current_date.day) in holiday_dates
            holiday_multiplier = 0.3 if is_holiday else 1.0
            
            # Weather impact simulation (random weather effects)
            weather_impact = random.normalvariate(1.0, 0.1)  # ±10% weather variation
            weather_impact = max(0.7, min(1.3, weather_impact))  # Cap between 70%-130%
            
            # Generate daily revenue with multiple factors
            base_revenue = {
                0: 750,  # Monday
                1: 780,  # Tuesday  
                2: 800,  # Wednesday
                3: 820,  # Thursday
                4: 850,  # Friday - highest
                5: 600,  # Saturday - lower weekend
            }[day_of_week]
            
            # Apply all multipliers
            adjusted_revenue = base_revenue * seasonal_multiplier * holiday_multiplier * weather_impact
            daily_revenue = random.normalvariate(adjusted_revenue, adjusted_revenue * 0.15)  # 15% variance
            daily_revenue = max(150, daily_revenue)  # Minimum revenue floor
            
            # Add multiple revenue entries to simulate different payment methods/times
            revenue_splits = random.randint(1, 4)  # 1-4 revenue entries per day
            for split in range(revenue_splits):
                split_amount = daily_revenue / revenue_splits
                split_variance = random.normalvariate(split_amount, split_amount * 0.1)
                
                data.append({
                    'date': current_date,
                    'amount': round(max(10, split_variance), 2),  # POSITIVE amount for revenue
                    'description': random.choice(['morning sales', 'afternoon sales', 'evening sales', 'card payments', 'cash sales']),
                    'category': 'other',
                    'payment_method': random.choice(['card', 'cash'])
                })
            
            # EXPENSES - All amounts will be POSITIVE (representing expense amounts)
            
            # Daily ingredients - varies by day of week and season
            ingredient_probability = {
                0: 0.8, 1: 0.7, 2: 0.8, 3: 0.9, 4: 0.9, 5: 0.6  # Higher restocking Mon, Wed-Fri
            }[day_of_week]
            
            if random.random() < ingredient_probability:
                # Multiple ingredient purchases per day
                num_ingredients = random.randint(1, 3)
                for _ in range(num_ingredients):
                    base_cost = random.normalvariate(85, 25) * seasonal_multiplier  # Seasonal price variation
                    ingredient_items = [
                        'flour', 'coffee beans', 'whole milk', 'oat milk', 'sugar', 'pastries', 
                        'bread', 'butter', 'cream', 'chocolate', 'tea bags', 'syrup'
                    ]
                    data.append({
                        'date': current_date,
                        'amount': round(abs(base_cost), 2),  # POSITIVE amount for expenses
                        'description': random.choice(ingredient_items),
                        'category': 'ingredients',
                        'payment_method': random.choice(['card', 'cash'])
                    })
            
            # Supplies (more frequent, smaller amounts)
            if random.random() > 0.5:  # 50% chance
                supply_cost = random.normalvariate(35, 12)
                supply_items = [
                    'coffee cups', 'lids', 'napkins', 'straws', 'cleaning supplies', 
                    'takeout containers', 'paper towels', 'toilet paper', 'hand soap'
                ]
                data.append({
                    'date': current_date,
                    'amount': round(abs(supply_cost), 2),  # POSITIVE amount
                    'description': random.choice(supply_items),
                    'category': 'supplies',
                    'payment_method': random.choice(['card', 'cash'])
                })
            
            # Monthly utilities - spread more realistically across the month
            if current_date.day in [1, 2, 3] or current_date.day in [15, 16, 17] or random.random() > 0.95:
                utility_bills = [
                    {'desc': 'electricity bill', 'amount': random.normalvariate(320, 60), 'prob': 0.15},
                    {'desc': 'water bill', 'amount': random.normalvariate(95, 25), 'prob': 0.12},
                    {'desc': 'internet/phone bill', 'amount': random.normalvariate(75, 15), 'prob': 0.08},
                    {'desc': 'gas bill', 'amount': random.normalvariate(140, 35), 'prob': 0.10},
                    {'desc': 'waste management', 'amount': random.normalvariate(45, 10), 'prob': 0.05},
                    {'desc': 'security system', 'amount': random.normalvariate(85, 20), 'prob': 0.04}
                ]
                
                for bill in utility_bills:
                    if random.random() < bill['prob']:
                        data.append({
                            'date': current_date,
                            'amount': round(abs(bill['amount']), 2),  # POSITIVE amount
                            'description': bill['desc'],
                            'category': 'utilities',
                            'payment_method': 'bank_transfer'
                        })
            
            # Equipment maintenance/purchases
            equipment_probability = 0.02 if day_of_week in [0, 1] else 0.005
            if random.random() < equipment_probability:
                equipment_cost = random.normalvariate(280, 120)
                equipment_items = [
                    'espresso machine maintenance', 'coffee grinder repair', 'new blender',
                    'POS system update', 'furniture repair', 'kitchen equipment', 'refrigerator maintenance',
                    'dishwasher repair', 'new cash register', 'sound system repair'
                ]
                data.append({
                    'date': current_date,
                    'amount': round(abs(equipment_cost), 2),  # POSITIVE amount
                    'description': random.choice(equipment_items),
                    'category': 'equipment',
                    'payment_method': 'card'
                })
            
            # Other business expenses
            other_expenses = [
                {'desc': 'business insurance', 'amount': 180, 'monthly_prob': 0.8},
                {'desc': 'software subscription', 'amount': 45, 'monthly_prob': 0.6},
                {'desc': 'marketing/advertising', 'amount': 120, 'weekly_prob': 0.3},
                {'desc': 'accounting fees', 'amount': 200, 'monthly_prob': 0.4},
                {'desc': 'legal fees', 'amount': 300, 'quarterly_prob': 0.2},
                {'desc': 'business license renewal', 'amount': 150, 'yearly_prob': 0.1},
                {'desc': 'staff training', 'amount': 85, 'monthly_prob': 0.2},
                {'desc': 'office supplies', 'amount': 60, 'monthly_prob': 0.4},
                {'desc': 'delivery fees', 'amount': 25, 'weekly_prob': 0.4},
                {'desc': 'bank fees', 'amount': 35, 'monthly_prob': 0.9}
            ]
            
            for expense in other_expenses:
                probability = 0
                if 'monthly_prob' in expense:
                    probability = expense['monthly_prob'] / 30
                elif 'weekly_prob' in expense:
                    probability = expense['weekly_prob'] / 7
                elif 'quarterly_prob' in expense:
                    probability = expense['quarterly_prob'] / 90
                elif 'yearly_prob' in expense:
                    probability = expense['yearly_prob'] / 365
                
                if random.random() < probability:
                    amount_variance = random.normalvariate(expense['amount'], expense['amount'] * 0.2)
                    data.append({
                        'date': current_date,
                        'amount': round(abs(amount_variance), 2),  # POSITIVE amount
                        'description': expense['desc'],
                        'category': 'other',
                        'payment_method': random.choice(['card', 'bank_transfer'])
                    })
            
            # Staff wages (weekly on Fridays)
            if day_of_week == 4 and random.random() > 0.3:
                staff_payment = random.normalvariate(400, 100)
                data.append({
                    'date': current_date,
                    'amount': round(abs(staff_payment), 2),  # POSITIVE amount
                    'description': 'staff wages',
                    'category': 'other',
                    'payment_method': 'bank_transfer'
                })
            
            # Rent payment - first few days of month
            if current_date.day <= 3 and random.random() > 0.6:
                rent_amount = random.normalvariate(2800, 200)
                data.append({
                    'date': current_date,
                    'amount': round(abs(rent_amount), 2),  # POSITIVE amount
                    'description': 'monthly rent',
                    'category': 'other',
                    'payment_method': 'bank_transfer'
                })
        
        df = pd.DataFrame(data)
        print(f"✅ Generated {len(df)} transaction records")
        print(f"📊 Data distribution:")
        print(f"   • Revenue entries (other category): {len(df[df['category'] == 'other'])}")
        print(f"   • Expense entries (all other categories): {len(df[df['category'] != 'other'])}")
        print(f"   • Date range: {df['date'].min()} to {df['date'].max()}")
        
        return df
    
    def insert_dummy_data_to_supabase(self, df):
        """Insert dummy data into Supabase"""
        
        print("📊 Inserting dummy data into Supabase...")
        
        try:
            # Convert DataFrame to list of dictionaries
            records = df.to_dict('records')
            
            # Convert date objects to strings for Supabase
            for record in records:
                record['date'] = record['date'].isoformat()
            
            # Insert in batches of 100
            batch_size = 100
            total_inserted = 0
            
            for i in range(0, len(records), batch_size):
                batch = records[i:i + batch_size]
                result = supabase.table("daily_expenses").insert(batch).execute()
                total_inserted += len(batch)
                print(f"✅ Inserted batch {i//batch_size + 1}: {len(batch)} records")
            
            print(f"🎉 Successfully inserted {total_inserted} records into Supabase!")
            return True
            
        except Exception as e:
            print(f"❌ Error inserting data: {str(e)}")
            return False
    
    def fetch_data_from_supabase(self):
        """Fetch expense data from Supabase for forecasting"""
        
        print("📥 Fetching data from Supabase...")
        
        try:
            result = supabase.table("daily_expenses").select("*").order("date", desc=False).execute()
            
            if not result.data:
                print("❌ No data found in database")
                return None
            
            df = pd.DataFrame(result.data)
            df['date'] = pd.to_datetime(df['date'])
            df['amount'] = pd.to_numeric(df['amount'])
            
            print(f"✅ Fetched {len(df)} records from database")
            return df
            
        except Exception as e:
            print(f"❌ Error fetching data: {str(e)}")
            return None
    
    def prepare_data_for_prophet(self, df):
        """Prepare data for Prophet forecasting - handles mixed positive/negative amounts"""
        
        # Handle mixed data where:
        # - Positive amounts in 'other' category = Revenue  
        # - Negative amounts in any category = Expenses
        # - Positive amounts in non-'other' categories = Expenses (your data has some like this)
        
        # Revenue: positive amounts in 'other' category
        revenue_df = df[(df['category'] == 'other') & (df['amount'] > 0)].groupby('date')['amount'].sum().reset_index()
        revenue_df.columns = ['ds', 'total_revenue']
        
        # Expenses: negative amounts (any category) + positive amounts in non-'other' categories
        expense_conditions = (
            (df['amount'] < 0) |  # All negative amounts are expenses
            ((df['category'] != 'other') & (df['amount'] > 0))  # Positive amounts in expense categories
        )
        expenses_df = df[expense_conditions]['amount'].abs().groupby(df['date']).sum().reset_index()
        expenses_df.columns = ['ds', 'total_expenses']
        
        # Calculate net cash flow (revenue - expenses)
        cash_flow_df = pd.merge(revenue_df, expenses_df, on='ds', how='outer').fillna(0)
        cash_flow_df['net_cash_flow'] = cash_flow_df['total_revenue'] - cash_flow_df['total_expenses']
        cash_flow_df = cash_flow_df[['ds', 'net_cash_flow']]
        
        # Category-wise expenses (take absolute values)
        category_data = {}
        for category in self.categories:
            cat_df = df[df['category'] == category]['amount'].abs().groupby(df['date']).sum().reset_index()
            cat_df.columns = ['ds', f'{category}_amount']
            category_data[category] = cat_df
        
        return {
            'daily_cash_flow': cash_flow_df,
            'daily_expenses': expenses_df,
            'daily_revenue': revenue_df,
            'categories': category_data
        }
    
    def forecast_with_prophet(self, df, periods=30, metric_name="Cash Flow"):
        """Create forecast using Prophet"""
        
        print(f"🔮 Creating {periods}-day forecast for {metric_name}...")
        
        # Prepare data for Prophet
        prophet_df = df[['ds', df.columns[1]]].copy()
        prophet_df.columns = ['ds', 'y']
        
        # Remove any rows with missing values
        prophet_df = prophet_df.dropna()
        
        if len(prophet_df) < 10:
            print(f"❌ Not enough data points for {metric_name} forecasting")
            return None
        
        # Create and fit Prophet model with compatible parameters
        model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=False,  # Changed from monthly_seasonality
            seasonality_mode='multiplicative',
            changepoint_prior_scale=0.1
        )
        
        # Add monthly seasonality manually
        model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
        
        model.fit(prophet_df)
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=periods)
        
        # Make predictions
        forecast = model.predict(future)
        
        return {
            'model': model,
            'forecast': forecast,
            'historical': prophet_df
        }
    
    def create_forecast_summary(self, forecasts):
        """Create business forecast summary"""
        
        summary = {}
        
        for metric, result in forecasts.items():
            if result is None:
                continue
                
            forecast = result['forecast']
            future_data = forecast.tail(30)  # Last 30 days (forecast period)
            
            summary[metric] = {
                'next_30_days_total': future_data['yhat'].sum(),
                'daily_average': future_data['yhat'].mean(),
                'trend': 'increasing' if future_data['yhat'].iloc[-1] > future_data['yhat'].iloc[0] else 'decreasing',
                'confidence_lower': future_data['yhat_lower'].sum(),
                'confidence_upper': future_data['yhat_upper'].sum()
            }
        
        return summary
    
    def generate_business_insights(self, summary):
        """Generate business insights from forecasts"""
        
        insights = []
        
        if 'expenses' in summary and 'revenue' in summary:
            exp_total = summary['expenses']['next_30_days_total']
            rev_total = summary['revenue']['next_30_days_total']
            projected_profit = rev_total - exp_total
            
            insights.append(f"💰 **PROFIT FORECAST (Next 30 Days)**")
            insights.append(f"   • Projected Revenue: ${rev_total:,.2f}")
            insights.append(f"   • Projected Expenses: ${exp_total:,.2f}")
            insights.append(f"   • **Projected Profit: ${projected_profit:,.2f}**")
            insights.append(f"   • Profit Margin: {(projected_profit/rev_total)*100:.1f}%")
            insights.append("")
        
        if 'expenses' in summary:
            exp_data = summary['expenses']
            insights.append(f"📉 **EXPENSE FORECAST**")
            insights.append(f"   • Daily Average Expenses: ${exp_data['daily_average']:,.2f}")
            insights.append(f"   • Expense Trend: {exp_data['trend']}")
            insights.append(f"   • Confidence Range: ${exp_data['confidence_lower']:,.2f} - ${exp_data['confidence_upper']:,.2f}")
            insights.append("")
        
        if 'revenue' in summary:
            rev_data = summary['revenue']
            insights.append(f"📈 **REVENUE FORECAST**")
            insights.append(f"   • Daily Average Revenue: ${rev_data['daily_average']:,.2f}")
            insights.append(f"   • Revenue Trend: {rev_data['trend']}")
            insights.append(f"   • Confidence Range: ${rev_data['confidence_lower']:,.2f} - ${rev_data['confidence_upper']:,.2f}")
        
        return '\n'.join(insights)
    
    def run_complete_analysis(self, generate_dummy=True, days=90, forecast_days=30):
        """Run complete forecasting analysis"""
        
        print("🚀 Starting Business Forecasting Analysis")
        print("=" * 50)
        
        # Step 1: Generate and insert dummy data if requested
        if generate_dummy:
            dummy_df = self.generate_dummy_data(days)
            self.insert_dummy_data_to_supabase(dummy_df)
        
        # Step 2: Fetch data from database
        df = self.fetch_data_from_supabase()
        if df is None:
            return
        
        print(f"\n📊 **DATA SUMMARY**")
        print(f"Total Records: {len(df)}")
        print(f"Date Range: {df['date'].min().date()} to {df['date'].max().date()}")
        
        # Calculate revenue and expenses properly
        revenue_total = df[(df['category'] == 'other') & (df['amount'] > 0)]['amount'].sum()
        expense_total = df[(df['amount'] < 0) | ((df['category'] != 'other') & (df['amount'] > 0))]['amount'].abs().sum()
        net_cash_flow = revenue_total - expense_total
        
        print(f"Total Revenue: ${revenue_total:,.2f}")
        print(f"Total Expenses: ${expense_total:,.2f}")
        print(f"Net Cash Flow: ${net_cash_flow:,.2f}")
        
        # Step 3: Prepare data for forecasting
        prepared_data = self.prepare_data_for_prophet(df)
        
        # Step 4: Create forecasts
        forecasts = {}
        
        # Forecast total expenses
        if len(prepared_data['daily_expenses']) > 10:
            forecasts['expenses'] = self.forecast_with_prophet(
                prepared_data['daily_expenses'], 
                forecast_days, 
                "Daily Expenses"
            )
        
        # Forecast total revenue
        if len(prepared_data['daily_revenue']) > 10:
            forecasts['revenue'] = self.forecast_with_prophet(
                prepared_data['daily_revenue'], 
                forecast_days, 
                "Daily Revenue"
            )
        
        # Forecast cash flow
        if len(prepared_data['daily_cash_flow']) > 10:
            forecasts['cash_flow'] = self.forecast_with_prophet(
                prepared_data['daily_cash_flow'], 
                forecast_days, 
                "Net Cash Flow"
            )
        
        # Step 5: Generate summary and insights
        summary = self.create_forecast_summary(forecasts)
        insights = self.generate_business_insights(summary)
        
        print(f"\n🔮 **BUSINESS FORECAST ({forecast_days} DAYS)**")
        print("=" * 50)
        print(insights)
        
        # Step 6: Category breakdown
        print(f"\n📋 **EXPENSE BREAKDOWN BY CATEGORY**")
        # Get all expenses (negative amounts + positive amounts in non-'other' categories)
        expense_mask = (df['amount'] < 0) | ((df['category'] != 'other') & (df['amount'] > 0))
        category_expenses = df[expense_mask].copy()
        category_expenses['abs_amount'] = category_expenses['amount'].abs()
        category_summary = category_expenses.groupby('category')['abs_amount'].sum().sort_values(ascending=False)
        
        total_expenses = category_summary.sum()
        for category, amount in category_summary.items():
            percentage = (amount / total_expenses) * 100 if total_expenses > 0 else 0
            print(f"   • {category.title()}: ${amount:,.2f} ({percentage:.1f}%)")
        
        print(f"\n✅ Analysis Complete!")
        
        return {
            'forecasts': forecasts,
            'summary': summary,
            'insights': insights,
            'data': df
        }

def main():
    """Main function to run the forecasting analysis"""
    
    forecaster = BusinessForecaster()
    
    # Run complete analysis with expanded training data
    results = forecaster.run_complete_analysis(
        generate_dummy=False,   # Set to True to generate comprehensive training data
        days=30,              # Full year of training data for better accuracy
        forecast_days=60       # Forecast 60 days ahead for longer-term planning
    )
    
    if results:
        print(f"\n🎯 **QUICK RECOMMENDATIONS**")
        forecasts = results['summary']
        
        if 'expenses' in forecasts:
            if forecasts['expenses']['trend'] == 'increasing':
                print("   ⚠️  Expenses are trending upward - consider cost optimization")
            else:
                print("   ✅ Expenses are stable or decreasing")
        
        if 'revenue' in forecasts:
            if forecasts['revenue']['trend'] == 'increasing':
                print("   📈 Revenue is growing - great job!")
            else:
                print("   📉 Revenue declining - focus on sales and marketing")

if __name__ == "__main__":
    # Make sure you have Prophet installed: pip install prophet
    main()