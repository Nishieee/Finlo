# 💰 Finlo: The Financial Ledger API

> **An AI-powered financial API for small businesses. Forecasts cash flow, generates SQL from plain English, and delivers insights like a virtual CFO.**

## 🌟 Inspiration

Small business owners constantly juggle receipts, spreadsheets, and overpriced accountants — all to answer one question:
**“Can I make payroll this month?”**

Finlo was built to make that question obsolete. It’s a calming “flow” for SMBs — a single AI brain that watches cash 24/7 and whispers what to do next.

---

## 🧠 What It Does

Finlo acts as an AI CFO + finance operating system.

You can say something like:

> *“Paid rent \$2,000”*

Finlo will:

* 🧾 **Convert it to SQL** and post it correctly to Supabase
* 🚨 **Flag trends or anomalies** (e.g., spike in ad spend)
* 📈 **Forecast your cash flow** 30–90 days ahead using Prophet
* 🧠 **Return insights** like “profit margin trending ↓ 8%”

---

## 🔧 Under the Hood

* **FastAPI**: Backend that serves REST endpoints
* **OpenAI API**: Converts natural language into SQL
* **Supabase**: Acts as the financial ledger (PostgreSQL backend)
* **Prophet**: Performs forecasting with monthly/seasonal logic and error bars
* **No ORM**: All database operations use raw SQL for performance

---

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

Create a `.env` file in the root directory with the following content:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Run the Server

```bash
# Method 1: Direct Python
python main.py

# Method 2: Uvicorn (recommended for development)
uvicorn main:app --reload
```

### 4. Use the API

Access the interactive API docs at:

📘 `http://localhost:8000/docs`

---

## 💡 Example Usage

### Add an Expense via SQL Generator

```bash
curl -X POST "http://localhost:8000/generate-sql" \
  -H "Content-Type: application/json" \
  -d '{"input_text": "bought coffee beans for $150"}'
```

### Get a 30-Day Forecast

```bash
curl "http://localhost:8000/forecast/comprehensive/30"
```

---

## 🔧 Cash Flow Rules

* **Expenses (outgoing):** Use negative values → `-50.00`
* **Revenue (incoming):** Use positive values → `500.00`

---

## ✅ Accomplishments

* ⏱️ End-to-end flow: voice → SQL → forecast in under 30 seconds
* 📉 Forecast error (MAPE) under 15% in back-tests
* 🛠️ Zero-config setup: just plug in Supabase keys and go

---

## 📘 What We Learned

* Transparency builds trust — forecasts need error bars
* SMBs want clear, actionable **sentences**, not just charts
* Audio and API robustness requires defensive design (timeouts, fallbacks, logging)

---

## 🔮 What’s Next for Finlo

* 📱 Mobile PWA + browser extension for auto-importing receipts
* 🔔 Rules engine: alerts when runway < 3 weeks
* 📦 One-click tax prep: CSV exports or integration with e-filing services
* 🔐 SOC 2 + PCI compliance for scaling to fintech partners

---

## 📎 Links

* 🔗 [Video](https://youtu.be/ndShkzxVM5A)
* 🔗 [Devpost submission](https://devpost.com/software/finlo-finance-flow)

