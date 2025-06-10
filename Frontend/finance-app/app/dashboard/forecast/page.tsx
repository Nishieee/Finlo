"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react"

interface ForecastData {
  metric: string
  period: string
  currentValue: number
  projectedValue: number
  trend: "up" | "down" | "stable"
  confidence: number
  insights: string[]
}

export default function ForecastPage() {
  const [metric, setMetric] = useState("revenue")
  const [period, setPeriod] = useState("30")
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchForecast = async () => {
    setLoading(true)
    try {
      // Replace with actual API call
      // const response = await fetch('https://your-backend-url.com/forecast/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ metric, period: parseInt(period) })
      // })
      // const data = await response.json()

      // Mock data for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockData: ForecastData = {
        metric,
        period,
        currentValue: metric === "revenue" ? 45200 : metric === "expenses" ? 29780 : 15420,
        projectedValue: metric === "revenue" ? 52000 : metric === "expenses" ? 31500 : 20500,
        trend: "up",
        confidence: 85,
        insights: [
          `Based on your current ${metric} trends, we expect continued growth`,
          `Your ${metric} has been consistently increasing over the past 3 months`,
          `Consider planning for increased cash flow needs in the coming period`,
        ],
      }

      setForecastData(mockData)
    } catch (error) {
      console.error("Error fetching forecast:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecast()
  }, [metric, period])

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "revenue":
        return "Revenue"
      case "expenses":
        return "Expenses"
      case "profit":
        return "Profit"
      case "cashflow":
        return "Cash Flow"
      default:
        return metric
    }
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "7":
        return "7 days"
      case "30":
        return "30 days"
      case "90":
        return "90 days"
      default:
        return `${period} days`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Forecast</h1>
        <p className="text-gray-600 mt-2">See where your business finances are heading based on current trends</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Settings</CardTitle>
          <CardDescription>Choose what you want to forecast and for how long</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What to forecast</label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="cashflow">Cash Flow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Next 7 days</SelectItem>
                  <SelectItem value="30">Next 30 days</SelectItem>
                  <SelectItem value="90">Next 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Results */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Generating forecast...</span>
            </div>
          </CardContent>
        </Card>
      ) : forecastData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {getMetricLabel(forecastData.metric)} Forecast
              </CardTitle>
              <CardDescription>Projection for the next {getPeriodLabel(forecastData.period)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Current</p>
                  <p className="text-2xl font-bold">${forecastData.currentValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Projected</p>
                  <p className="text-2xl font-bold text-blue-600">${forecastData.projectedValue.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {forecastData.trend === "up" ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${forecastData.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {(
                    ((forecastData.projectedValue - forecastData.currentValue) / forecastData.currentValue) *
                    100
                  ).toFixed(1)}
                  %{forecastData.trend === "up" ? " increase" : " decrease"}
                </span>
                <Badge variant="secondary">{forecastData.confidence}% confidence</Badge>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Timeline</span>
                </div>
                <p className="text-sm text-gray-600">
                  Based on current trends, your {forecastData.metric} is expected to reach{" "}
                  <strong>${forecastData.projectedValue.toLocaleString()}</strong> by{" "}
                  {new Date(Date.now() + Number.parseInt(period) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Insights & Recommendations</CardTitle>
              <CardDescription>What this forecast means for your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecastData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">💡 Pro Tip</h4>
                <p className="text-sm text-yellow-700">
                  Forecasts are based on historical data and current trends. Keep adding expenses regularly to improve
                  accuracy!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>How Forecasting Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="font-medium mb-2">Analyze Trends</h3>
              <p className="text-sm text-gray-600">We look at your spending and earning patterns over time</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🔮</span>
              </div>
              <h3 className="font-medium mb-2">Predict Future</h3>
              <p className="text-sm text-gray-600">Using smart algorithms to project where you're heading</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💡</span>
              </div>
              <h3 className="font-medium mb-2">Get Insights</h3>
              <p className="text-sm text-gray-600">Receive actionable recommendations for your business</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
