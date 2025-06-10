"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Send, CheckCircle, AlertCircle, TrendingUp, Receipt, BarChart3 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { parseExpense, getDashboardSummary } from "@/lib/api"
import type { DashboardSummary } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function MainAppPage() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    expense?: {
      amount: number
      description: string
      category: string
      paymentMethod: string
    }
  } | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isFirstTime, setIsFirstTime] = useState(true)
  const { toast } = useToast()

  // Load dashboard summary
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await getDashboardSummary()
        setSummary(data)
      } catch (error) {
        console.error("Failed to load dashboard:", error)
      }
    }
    loadSummary()

    // Check if user has been here before
    const hasVisited = localStorage.getItem("hasVisitedApp")
    if (hasVisited) {
      setIsFirstTime(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await parseExpense(input)
      setResult(response)
      setInput("")

      // Mark as not first time and refresh summary
      if (isFirstTime) {
        setIsFirstTime(false)
        localStorage.setItem("hasVisitedApp", "true")
      }

      // Refresh dashboard summary
      const updatedSummary = await getDashboardSummary()
      setSummary(updatedSummary)

      toast({
        title: "Expense Added!",
        description: "Your expense has been successfully recorded.",
      })
    } catch (error) {
      setResult({
        success: false,
        message: "Sorry, something went wrong. Please try again.",
      })
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const examples = [
    "Spent $200 on flowers for the shop",
    "Paid $150 for electricity bill",
    "Bought office supplies for $75 with card",
    "Gas for delivery truck $45 cash",
    "Monthly software subscription $99",
    "Lunch meeting with client $65",
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Message for First Time Users */}
      {isFirstTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Welcome to your finance dashboard! 🎉</h3>
              <p className="text-blue-800 text-sm mb-3">
                You're all set! Just type what you spent in plain English below, and we'll take care of the rest.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  💡 Tip: Be natural - "bought coffee $5" works great!
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Input Section */}
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="text-2xl">💬 What did you spend money on?</CardTitle>
          <CardDescription className="text-lg">
            Just type naturally, like "spent $200 on flowers" or "paid electricity bill $150"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expense-input" className="text-base font-medium">
                Describe your expense
              </Label>
              <div className="relative">
                <Textarea
                  id="expense-input"
                  placeholder="e.g., Bought office supplies for $75 with credit card"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[120px] pr-12 text-lg resize-none border-2 focus:border-blue-300"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  disabled
                  title="Voice input coming soon!"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700"
              disabled={!input.trim() || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Add Expense
                </>
              )}
            </Button>
          </form>

          {/* Result */}
          {result && (
            <Alert className={`mt-6 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                {result.message}
                {result.expense && (
                  <div className="mt-3 p-4 bg-white rounded border">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Amount:</span> ${result.expense.amount}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {result.expense.category}
                      </div>
                      <div>
                        <span className="font-medium">Description:</span> {result.expense.description}
                      </div>
                      <div>
                        <span className="font-medium">Payment:</span> {result.expense.paymentMethod}
                      </div>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${summary.cash_flow.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Money in minus money out</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.expenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Runway</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.runway} days</div>
              <p className="text-xs text-muted-foreground">At current rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Examples Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">💡 Need inspiration? Try these examples:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto p-4 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => setInput(example)}
                disabled={loading}
              >
                <span className="text-blue-600 mr-2">💬</span>"{example}"
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/app/expenses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-blue-200">
            <CardContent className="p-6 text-center">
              <Receipt className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">View All Expenses</h3>
              <p className="text-sm text-gray-600">See, edit, and manage your expense history</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/forecast">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-purple-200">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Financial Forecast</h3>
              <p className="text-sm text-gray-600">See where your money is heading</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/finance-flow">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-green-200">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Finance Flow</h3>
              <p className="text-sm text-gray-600">Advanced accounts payable & receivable</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Tips Section */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">💡 Tips for better results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <strong>Include the amount:</strong> "$150" or "150 dollars" both work great
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <strong>Describe what you bought:</strong> "office supplies", "electricity bill", "client lunch"
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <strong>Add payment method if you want:</strong> "with card", "cash", "check"
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <strong>Be natural:</strong> Write like you're telling a friend what you spent money on
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
