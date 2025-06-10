"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Send, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AddExpensePage() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    setResult(null)

    try {
      // Replace with actual API call
      // const response = await fetch('https://your-backend-url.com/expenses/parse', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ input_text: input })
      // })
      // const data = await response.json()

      // Mock response for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API delay

      const mockResponse = {
        success: true,
        message: "Expense added successfully!",
        expense: {
          amount: 150,
          description: "Office supplies",
          category: "Office & Admin",
          paymentMethod: "Credit Card",
        },
      }

      setResult(mockResponse)
      setInput("")
    } catch (error) {
      setResult({
        success: false,
        message: "Sorry, something went wrong. Please try again.",
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
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add an Expense</h1>
        <p className="text-gray-600 mt-2">
          Just tell us what you spent in plain English - we'll take care of the rest!
        </p>
      </div>

      {/* Main Input */}
      <Card>
        <CardHeader>
          <CardTitle>What did you spend money on?</CardTitle>
          <CardDescription>
            Type naturally, like "spent $200 on flowers" or "paid electricity bill $150"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expense-input">Describe your expense</Label>
              <div className="relative">
                <Textarea
                  id="expense-input"
                  placeholder="e.g., Bought office supplies for $75 with credit card"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[100px] pr-12 text-lg"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-gray-400"
                  disabled
                  title="Voice input coming soon!"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full text-lg py-6" disabled={!input.trim() || loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Add Expense
                </>
              )}
            </Button>
          </form>

          {/* Result */}
          {result && (
            <Alert className={`mt-4 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                {result.message}
                {result.expense && (
                  <div className="mt-2 p-3 bg-white rounded border">
                    <p>
                      <strong>Amount:</strong> ${result.expense.amount}
                    </p>
                    <p>
                      <strong>Description:</strong> {result.expense.description}
                    </p>
                    <p>
                      <strong>Category:</strong> {result.expense.category}
                    </p>
                    <p>
                      <strong>Payment Method:</strong> {result.expense.paymentMethod}
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Need inspiration? Try these examples:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto p-4"
                onClick={() => setInput(example)}
                disabled={loading}
              >
                "{example}"
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Tips for better results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">• Include the amount (e.g., "$150" or "150 dollars")</p>
          <p className="text-sm text-gray-600">
            • Mention what you bought (e.g., "office supplies", "electricity bill")
          </p>
          <p className="text-sm text-gray-600">• Add payment method if you want (e.g., "with card", "cash", "check")</p>
          <p className="text-sm text-gray-600">• Be natural - write like you're telling a friend!</p>
        </CardContent>
      </Card>
    </div>
  )
}
