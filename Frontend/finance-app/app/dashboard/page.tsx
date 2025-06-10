"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp, Receipt, Calendar } from "lucide-react"
import Link from "next/link"

interface DashboardData {
  cashFlow: number
  revenue: number
  expenses: number
  profit: number
  runway: number
  recentExpenses: Array<{
    id: string
    description: string
    amount: number
    date: string
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call - replace with actual API call
    const fetchDashboardData = async () => {
      try {
        // const response = await fetch('https://your-backend-url.com/forecast/')
        // const data = await response.json()

        // Mock data for demonstration
        const mockData: DashboardData = {
          cashFlow: 15420,
          revenue: 45200,
          expenses: 29780,
          profit: 15420,
          runway: 90,
          recentExpenses: [
            { id: "1", description: "Office supplies", amount: 150, date: "2024-01-15" },
            { id: "2", description: "Marketing ads", amount: 500, date: "2024-01-14" },
            { id: "3", description: "Software subscription", amount: 99, date: "2024-01-13" },
          ],
        }

        setData(mockData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div>Error loading dashboard data</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Business Dashboard</h1>
          <p className="text-gray-600">Here's how your business is doing this month</p>
        </div>
        <Link href="/dashboard/add-expense">
          <Button size="lg">
            <DollarSign className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${data.cashFlow.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpIcon className="inline h-3 w-3 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpIcon className="inline h-3 w-3 text-green-500" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${data.expenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowDownIcon className="inline h-3 w-3 text-red-500" />
              +3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Runway</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.runway} days</div>
            <p className="text-xs text-muted-foreground">At current burn rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your latest business expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-500">{expense.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-${expense.amount}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/expenses">
                <Button variant="outline" className="w-full">
                  View All Expenses
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your finances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/add-expense">
              <Button className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Add New Expense
              </Button>
            </Link>
            <Link href="/dashboard/forecast">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Forecast
              </Button>
            </Link>
            <Link href="/dashboard/expenses">
              <Button variant="outline" className="w-full justify-start">
                <Receipt className="mr-2 h-4 w-4" />
                Review Expenses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
