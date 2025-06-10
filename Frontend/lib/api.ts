// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Types
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

// Mock data for development
const mockSummary: DashboardSummary = {
  cash_flow: 15420,
  revenue: 45200,
  expenses: 29780,
  runway: 90,
}

const mockExpenses: Expense[] = [
  {
    id: "1",
    date: "2024-01-15",
    description: "Office supplies",
    category: "Office",
    payment_method: "Credit Card",
    amount: 150,
  },
  {
    id: "2",
    date: "2024-01-14",
    description: "Marketing ads",
    category: "Marketing",
    payment_method: "Credit Card",
    amount: 500,
  },
  {
    id: "3",
    date: "2024-01-13",
    description: "Software subscription",
    category: "Office",
    payment_method: "Credit Card",
    amount: 99,
  },
]

// API Functions

export async function parseExpense(inputText: string): Promise<ParseExpenseResponse> {
  try {
    // In production, replace with actual API call:
    // const response = await fetch(`${API_BASE_URL}/expenses/parse`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ input_text: inputText })
    // })
    // return await response.json()

    // Mock implementation for development
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API delay

    // Simple parsing logic for demo
    const amountMatch = inputText.match(/\$?(\d+(?:\.\d{2})?)/)
    const amount = amountMatch ? Number.parseFloat(amountMatch[1]) : 0

    let category = "General"
    let paymentMethod = "Cash"

    // Simple categorization
    if (inputText.toLowerCase().includes("office") || inputText.toLowerCase().includes("supplies")) {
      category = "Office & Admin"
    } else if (inputText.toLowerCase().includes("gas") || inputText.toLowerCase().includes("fuel")) {
      category = "Transportation"
    } else if (inputText.toLowerCase().includes("food") || inputText.toLowerCase().includes("lunch")) {
      category = "Meals"
    } else if (inputText.toLowerCase().includes("electric") || inputText.toLowerCase().includes("utility")) {
      category = "Utilities"
    } else if (inputText.toLowerCase().includes("flower") || inputText.toLowerCase().includes("inventory")) {
      category = "Inventory"
    }

    // Payment method detection
    if (inputText.toLowerCase().includes("card") || inputText.toLowerCase().includes("credit")) {
      paymentMethod = "Credit Card"
    } else if (inputText.toLowerCase().includes("debit")) {
      paymentMethod = "Debit Card"
    } else if (inputText.toLowerCase().includes("check")) {
      paymentMethod = "Check"
    }

    const description = inputText
      .replace(/\$?\d+(?:\.\d{2})?/, "")
      .replace(/with (card|credit|debit|cash|check)/i, "")
      .trim()

    return {
      success: true,
      message: "Expense added successfully!",
      expense: {
        amount,
        description: description || "Expense",
        category,
        paymentMethod,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: "Sorry, something went wrong. Please try again.",
    }
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    // In production, replace with actual API call:
    // const response = await fetch(`${API_BASE_URL}/dashboard/summary`)
    // return await response.json()

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return mockSummary
  } catch (error) {
    throw new Error("Failed to fetch dashboard summary")
  }
}

export async function getExpenses(): Promise<Expense[]> {
  try {
    // In production, replace with actual API call:
    // const response = await fetch(`${API_BASE_URL}/expenses/`)
    // return await response.json()

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 800))
    return mockExpenses
  } catch (error) {
    throw new Error("Failed to fetch expenses")
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    // In production, replace with actual API call:
    // await fetch(`${API_BASE_URL}/expenses/${id}`, { method: 'DELETE' })

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log(`Deleting expense ${id}`)
  } catch (error) {
    throw new Error("Failed to delete expense")
  }
}

export async function updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
  try {
    // In production, replace with actual API call:
    // const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(expense)
    // })
    // return await response.json()

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { ...mockExpenses[0], ...expense, id }
  } catch (error) {
    throw new Error("Failed to update expense")
  }
}

export async function getForecast(metric: string, period: number): Promise<ForecastData> {
  try {
    // In production, replace with actual API call:
    // const response = await fetch(`${API_BASE_URL}/forecast/`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ metric, period })
    // })
    // return await response.json()

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const baseValue = metric === "revenue" ? 45200 : metric === "expenses" ? 29780 : 15420
    const projectedValue = baseValue * (1 + (Math.random() * 0.3 - 0.1)) // ±10-20% variation

    // Generate chart data
    const chartData = []
    const days = period
    for (let i = 0; i <= days; i += Math.max(1, Math.floor(days / 10))) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const progress = i / days
      const value = baseValue + (projectedValue - baseValue) * progress + (Math.random() * 1000 - 500)
      chartData.push({
        date: date.toISOString().split("T")[0],
        value: Math.round(value),
      })
    }

    const insights = [
      `Based on your current ${metric} trends, we expect continued growth over the next ${period} days`,
      `Your ${metric} has been consistently increasing over the past 3 months`,
      `Consider planning for increased cash flow needs in the coming period`,
      `This forecast assumes your current business patterns continue`,
    ]

    return {
      metric,
      period: period.toString(),
      currentValue: baseValue,
      projectedValue: Math.round(projectedValue),
      trend: projectedValue > baseValue ? "up" : "down",
      confidence: 85,
      insights,
      chartData,
    }
  } catch (error) {
    throw new Error("Failed to generate forecast")
  }
}
