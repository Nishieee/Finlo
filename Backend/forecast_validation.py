
#file for validation ---> validating the forecasting model
import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
import matplotlib.pyplot as plt
import seaborn as sns
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import warnings
warnings.filterwarnings('ignore')

load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

class ForecastValidator:
    def __init__(self):
        self.categories = ['ingredients', 'utilities', 'supplies', 'equipment', 'other']
        
    def fetch_data_from_supabase(self):
        """Fetch expense data from Supabase"""
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
    
    def validate_data_quality(self, df):
        """Check data quality and identify potential issues"""
        
        print("\n📊 **DATA QUALITY VALIDATION**")
        print("=" * 40)
        
        # Basic data checks
        print(f"1. **Data Completeness:**")
        print(f"   • Total records: {len(df)}")
        print(f"   • Date range: {df['date'].min().date()} to {df['date'].max().date()}")
        print(f"   • Missing values: {df.isnull().sum().sum()}")
        
        # Check for data anomalies
        print(f"\n2. **Data Anomalies:**")
        revenue_data = df[df['amount'] > 0]
        expense_data = df[df['amount'] < 0]
        
        if len(revenue_data) > 0:
            avg_revenue = revenue_data['amount'].mean()
            outlier_revenue = revenue_data[revenue_data['amount'] > avg_revenue * 3]
            print(f"   • Revenue outliers (>3x average): {len(outlier_revenue)}")
        
        if len(expense_data) > 0:
            avg_expense = abs(expense_data['amount'].mean())
            outlier_expense = expense_data[abs(expense_data['amount']) > avg_expense * 3]
            print(f"   • Expense outliers (>3x average): {len(outlier_expense)}")
        
        # Check data consistency
        print(f"\n3. **Data Consistency:**")
        daily_counts = df.groupby('date').size()
        print(f"   • Average transactions per day: {daily_counts.mean():.1f}")
        print(f"   • Days with no transactions: {(daily_counts == 0).sum()}")
        
        # Category distribution
        print(f"\n4. **Category Distribution:**")
        category_counts = df['category'].value_counts()
        for category, count in category_counts.items():
            percentage = (count / len(df)) * 100
            print(f"   • {category}: {count} ({percentage:.1f}%)")
        
        return {
            'total_records': len(df),
            'date_range': (df['date'].min(), df['date'].max()),
            'missing_values': df.isnull().sum().sum(),
            'revenue_outliers': len(outlier_revenue) if len(revenue_data) > 0 else 0,
            'expense_outliers': len(outlier_expense) if len(expense_data) > 0 else 0
        }
    
    def perform_backtesting(self, df, test_days=14):
        """Perform backtesting - train on past data, predict recent period"""
        
        print(f"\n🔬 **BACKTESTING VALIDATION**")
        print("=" * 40)
        print(f"Testing forecast accuracy on last {test_days} days")
        
        # Prepare daily revenue data
        daily_revenue = df[df['amount'] > 0].groupby('date')['amount'].sum().reset_index()
        daily_revenue.columns = ['ds', 'y']
        
        if len(daily_revenue) < test_days + 10:
            print("❌ Not enough data for backtesting")
            return None
        
        # Split data - train on all but last test_days
        cutoff_date = daily_revenue['ds'].max() - timedelta(days=test_days)
        train_data = daily_revenue[daily_revenue['ds'] <= cutoff_date]
        actual_data = daily_revenue[daily_revenue['ds'] > cutoff_date]
        
        print(f"Training period: {train_data['ds'].min().date()} to {train_data['ds'].max().date()}")
        print(f"Testing period: {actual_data['ds'].min().date()} to {actual_data['ds'].max().date()}")
        
        # Train model on historical data
        model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=False,
            changepoint_prior_scale=0.1
        )
        model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
        model.fit(train_data)
        
        # Make predictions for test period
        future = model.make_future_dataframe(periods=test_days)
        forecast = model.predict(future)
        
        # Get predictions for test period
        test_predictions = forecast.tail(test_days)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
        
        # Merge with actual data
        comparison = pd.merge(actual_data, test_predictions, on='ds', how='inner')
        
        if len(comparison) == 0:
            print("❌ No matching dates for comparison")
            return None
        
        # Calculate accuracy metrics
        mae = np.mean(np.abs(comparison['y'] - comparison['yhat']))
        mape = np.mean(np.abs((comparison['y'] - comparison['yhat']) / comparison['y'])) * 100
        rmse = np.sqrt(np.mean((comparison['y'] - comparison['yhat']) ** 2))
        
        # Check if actual values fall within confidence intervals
        within_ci = ((comparison['y'] >= comparison['yhat_lower']) & 
                    (comparison['y'] <= comparison['yhat_upper'])).mean() * 100
        
        print(f"\n📈 **ACCURACY METRICS:**")
        print(f"   • Mean Absolute Error (MAE): ${mae:.2f}")
        print(f"   • Mean Absolute Percentage Error (MAPE): {mape:.1f}%")
        print(f"   • Root Mean Square Error (RMSE): ${rmse:.2f}")
        print(f"   • Predictions within confidence interval: {within_ci:.1f}%")
        
        # Quality assessment
        if mape < 10:
            accuracy_level = "EXCELLENT"
        elif mape < 20:
            accuracy_level = "GOOD"
        elif mape < 30:
            accuracy_level = "FAIR"
        else:
            accuracy_level = "POOR"
        
        print(f"   • **Overall Accuracy: {accuracy_level}**")
        
        return {
            'mae': mae,
            'mape': mape,
            'rmse': rmse,
            'confidence_coverage': within_ci,
            'accuracy_level': accuracy_level,
            'comparison_data': comparison
        }
    
    def cross_validate_model(self, df):
        """Perform cross-validation using Prophet's built-in method"""
        
        print(f"\n🔄 **CROSS-VALIDATION**")
        print("=" * 40)
        
        # Prepare data
        daily_revenue = df[df['amount'] > 0].groupby('date')['amount'].sum().reset_index()
        daily_revenue.columns = ['ds', 'y']
        
        if len(daily_revenue) < 30:
            print("❌ Not enough data for cross-validation")
            return None
        
        # Create model
        model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=False
        )
        model.fit(daily_revenue)
        
        try:
            # Perform cross-validation
            df_cv = cross_validation(
                model, 
                initial='15 days',  # Initial training period
                period='7 days',    # Spacing between cutoff dates
                horizon='7 days'    # Forecast horizon
            )
            
            # Calculate performance metrics
            df_p = performance_metrics(df_cv)
            
            print("📊 **Cross-Validation Results:**")
            print(f"   • Average MAE: ${df_p['mae'].mean():.2f}")
            print(f"   • Average MAPE: {df_p['mape'].mean():.3f}")
            print(f"   • Average RMSE: ${df_p['rmse'].mean():.2f}")
            
            return df_p
            
        except Exception as e:
            print(f"❌ Cross-validation failed: {str(e)}")
            return None
    
    def validate_business_logic(self, df):
        """Validate forecasts against business logic and common sense"""
        
        print(f"\n🧠 **BUSINESS LOGIC VALIDATION**")
        print("=" * 40)
        
        # Calculate current business metrics
        recent_30_days = df[df['date'] >= (df['date'].max() - timedelta(days=30))]
        
        current_daily_revenue = recent_30_days[recent_30_days['amount'] > 0]['amount'].sum() / 30
        current_daily_expenses = abs(recent_30_days[recent_30_days['amount'] < 0]['amount'].sum()) / 30
        current_profit_margin = (current_daily_revenue - current_daily_expenses) / current_daily_revenue * 100
        
        print(f"📊 **Current Business Metrics (Last 30 Days):**")
        print(f"   • Daily Revenue: ${current_daily_revenue:.2f}")
        print(f"   • Daily Expenses: ${current_daily_expenses:.2f}")
        print(f"   • Profit Margin: {current_profit_margin:.1f}%")
        
        # Business logic checks
        print(f"\n✅ **Sanity Checks:**")
        
        # Check 1: Revenue should be positive and reasonable
        if current_daily_revenue > 0:
            print(f"   ✅ Revenue is positive: ${current_daily_revenue:.2f}/day")
        else:
            print(f"   ❌ No revenue detected - check data")
        
        # Check 2: Expenses should be reasonable proportion of revenue
        expense_ratio = (current_daily_expenses / current_daily_revenue) * 100
        if expense_ratio < 80:
            print(f"   ✅ Expense ratio is healthy: {expense_ratio:.1f}%")
        else:
            print(f"   ⚠️  High expense ratio: {expense_ratio:.1f}%")
        
        # Check 3: Profit margin should be positive
        if current_profit_margin > 0:
            print(f"   ✅ Business is profitable: {current_profit_margin:.1f}% margin")
        else:
            print(f"   ❌ Business is losing money: {current_profit_margin:.1f}% margin")
        
        # Check 4: Seasonal patterns
        df['day_of_week'] = df['date'].dt.dayofweek
        revenue_by_day = df[df['amount'] > 0].groupby('day_of_week')['amount'].mean()
        
        print(f"\n📅 **Weekly Pattern Analysis:**")
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for i, day in enumerate(days):
            if i in revenue_by_day.index:
                print(f"   • {day}: ${revenue_by_day[i]:.2f}")
        
        return {
            'daily_revenue': current_daily_revenue,
            'daily_expenses': current_daily_expenses,
            'profit_margin': current_profit_margin,
            'expense_ratio': expense_ratio
        }
    
    def compare_with_industry_benchmarks(self, business_metrics):
        """Compare your business metrics with industry standards"""
        
        print(f"\n🏭 **INDUSTRY BENCHMARK COMPARISON**")
        print("=" * 40)
        
        # Cafe/Restaurant industry benchmarks (approximate)
        benchmarks = {
            'food_cost_percentage': (25, 35),      # Food costs should be 25-35% of revenue
            'labor_cost_percentage': (25, 35),     # Labor costs should be 25-35% of revenue
            'profit_margin': (3, 15),              # Net profit margin should be 3-15%
            'daily_revenue_per_sqft': (3, 8)      # Revenue per square foot (varies widely)
        }
        
        profit_margin = business_metrics['profit_margin']
        expense_ratio = business_metrics['expense_ratio']
        
        print(f"📊 **Your Performance vs Industry:**")
        
        # Profit margin comparison
        if benchmarks['profit_margin'][0] <= profit_margin <= benchmarks['profit_margin'][1]:
            print(f"   ✅ Profit margin ({profit_margin:.1f}%) is within industry range ({benchmarks['profit_margin'][0]}-{benchmarks['profit_margin'][1]}%)")
        elif profit_margin > benchmarks['profit_margin'][1]:
            print(f"   🎉 Profit margin ({profit_margin:.1f}%) is ABOVE industry average - excellent!")
        else:
            print(f"   ⚠️  Profit margin ({profit_margin:.1f}%) is below industry range")
        
        # Expense ratio comparison
        if expense_ratio < 65:  # Industry average total expenses
            print(f"   ✅ Expense control ({expense_ratio:.1f}%) is good")
        else:
            print(f"   ⚠️  High expense ratio ({expense_ratio:.1f}%) - consider cost optimization")
        
        print(f"\n💡 **Validation Confidence Level:**")
        
        confidence_score = 0
        if profit_margin > 0:
            confidence_score += 25
        if expense_ratio < 70:
            confidence_score += 25
        if business_metrics['daily_revenue'] > 300:  # Reasonable daily revenue
            confidence_score += 25
        if business_metrics['daily_expenses'] > 0:
            confidence_score += 25
        
        if confidence_score >= 75:
            confidence_level = "HIGH"
            confidence_color = "🟢"
        elif confidence_score >= 50:
            confidence_level = "MEDIUM"
            confidence_color = "🟡"
        else:
            confidence_level = "LOW"
            confidence_color = "🔴"
        
        print(f"   {confidence_color} **Forecast Confidence: {confidence_level}** ({confidence_score}/100)")
        
        return confidence_score
    
    def generate_validation_report(self):
        """Generate comprehensive validation report"""
        
        print("🔍 **FORECAST VALIDATION REPORT**")
        print("=" * 50)
        
        # Step 1: Fetch data
        df = self.fetch_data_from_supabase()
        if df is None:
            return
        
        # Step 2: Data quality validation
        data_quality = self.validate_data_quality(df)
        
        # Step 3: Backtesting
        backtest_results = self.perform_backtesting(df, test_days=14)
        
        # Step 4: Cross-validation
        cv_results = self.cross_validate_model(df)
        
        # Step 5: Business logic validation
        business_metrics = self.validate_business_logic(df)
        
        # Step 6: Industry comparison
        confidence_score = self.compare_with_industry_benchmarks(business_metrics)
        
        # Step 7: Final recommendations
        print(f"\n🎯 **FINAL VALIDATION SUMMARY**")
        print("=" * 40)
        
        if backtest_results:
            accuracy = backtest_results['accuracy_level']
            mape = backtest_results['mape']
            print(f"   • **Model Accuracy: {accuracy}** (MAPE: {mape:.1f}%)")
        
        print(f"   • **Data Quality: {'GOOD' if data_quality['missing_values'] == 0 else 'FAIR'}**")
        print(f"   • **Business Logic: {'VALID' if business_metrics['profit_margin'] > 0 else 'QUESTIONABLE'}**")
        print(f"   • **Overall Confidence: {confidence_score}/100**")
        
        print(f"\n💡 **Recommendations:**")
        
        if backtest_results and backtest_results['mape'] < 20:
            print("   ✅ Model predictions appear reliable")
        else:
            print("   ⚠️  Model predictions may be less accurate - use with caution")
        
        if business_metrics['profit_margin'] > 10:
            print("   ✅ Business fundamentals are strong")
        else:
            print("   ⚠️  Monitor business performance closely")
        
        if data_quality['total_records'] > 60:
            print("   ✅ Sufficient data for reliable forecasting")
        else:
            print("   ⚠️  Consider collecting more data for better accuracy")
        
        return {
            'data_quality': data_quality,
            'backtest_results': backtest_results,
            'business_metrics': business_metrics,
            'confidence_score': confidence_score
        }

def main():
    """Run forecast validation"""
    validator = ForecastValidator()
    results = validator.generate_validation_report()

if __name__ == "__main__":
    main()