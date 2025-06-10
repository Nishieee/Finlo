export interface DashboardSummary {
  cash_flow: number
  revenue: number
  expenses: number
  runway: number
}

export interface Expense {
  id: string
  date: string
  description: string
  category: string
  payment_method: string
  amount: number
}

export interface ForecastData {
  metric: string
  period: string
  currentValue: number
  projectedValue: number
  trend: "up" | "down" | "stable"
  confidence: number
  insights: string[]
  chartData: Array<{ date: string; value: number }>
}

export interface ParseExpenseResponse {
  success: boolean
  message: string
  expense?: {
    amount: number
    description: string
    category: string
    paymentMethod: string
  }
}
