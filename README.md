# Financial-Ledger




Complete business intelligence API with AI SQL generation and Prophet-based forecasting.

## 🚀 Quick Start

### 1. Python Environment
```bash
# Create virtual environment
python -m venv env

# Activate (Windows)
env\Scripts\activate

# Activate (Mac/Linux)
source env/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables
Create `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Database Setup
Create table in Supabase SQL Editor:
```sql
CREATE TABLE daily_expenses (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Run Server
```bash
# Method 1: Direct Python
python main.py

# Method 2: Uvicorn command
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Method 3: Development with auto-reload
uvicorn main:app --reload
```

**API Available:** `http://localhost:8000`  
**Docs Available:** `http://localhost:8000/docs`

## 📖 API Endpoints

### SQL Generation
- `POST /generate-sql` - Convert natural language to SQL
- `GET /examples` - See example inputs

### Forecasting
- `GET /forecast/comprehensive/30` - Full 30-day business forecast
- `GET /forecast/revenue/7` - 7-day revenue forecast
- `GET /metrics/current` - Current business metrics

### Documentation
- `GET /docs` - Interactive API documentation

## 💡 Usage Examples

**Add Expense:**
```bash
curl -X POST "http://localhost:8000/generate-sql" \
  -H "Content-Type: application/json" \
  -d '{"input_text": "bought coffee beans for $150"}'
```

**Get Forecast:**
```bash
curl "http://localhost:8000/forecast/comprehensive/30"
```

**Generate Test Data:**
```python
python business_forecasting.py  # Run with generate_dummy=True
```

## 🔧 Cash Flow Rules
- **Expenses** (outgoing): Negative amounts (-50.00)
- **Revenue** (incoming): Positive amounts (500.00)

## 📁 Project Structure
- `main.py` - FastAPI server & endpoints
- `business_forecasting.py` - Prophet forecasting logic
- `forecast_validation.py` - Model validation & backtesting

Visit `http://localhost:8000/docs` for full API documentation.
