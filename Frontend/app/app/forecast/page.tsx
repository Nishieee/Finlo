"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3, Target } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { getForecast } from "@/lib/api"
import type { ForecastData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function ForecastPage() {
  const [metric, setMetric] = useState("revenue")
  const [period, setPeriod] = useState("30")
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(true)
  const { toast } = useToast()

  const fetchForecast = async () => {
    setLoading(true)
    try {
      const data = await getForecast(metric, Number.parseInt(period))
      setForecastData(data)

      if (isFirstTime) {
        setIsFirstTime(false)
        toast({
          title: "Forecast Generated! 📊",
          description: "Your financial forecast is ready. Scroll down to see insights and recommendations.",
        })
      }
    } catch (error) {
      console.error("Error fetching forecast:", error)
      toast({
        title: "Error",
        description: "Failed to generate forecast. Please try again.",
        variant: "destructive",
      })
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

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "revenue":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "expenses":
        return <TrendingDown className="h-5 w-5 text-red-600" />
      case "profit":
        return <DollarSign className="h-5 w-5 text-blue-600" />
      case "cashflow":
        return <BarChart3 className="h-5 w-5 text-purple-600" />
      default:
        return <TrendingUp className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">💰 Financial Forecast</h1>
        <p className="text-gray-600 mt-2">See where your business finances are heading based on current trends</p>
      </div>

      {/* First Time User Guide */}
      {isFirstTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Welcome to Financial Forecasting! 🔮</h3>
              <p className="text-blue-800 text-sm mb-3">
                Choose what you want to forecast and for how long. We'll analyze your spending patterns and show you
                where your business is heading.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  💡 Try different timeframes to see short vs long-term trends
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Forecast Settings
          </CardTitle>
          <CardDescription>Choose what you want to forecast and for how long</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">What to forecast</label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">💰 Revenue (Money Coming In)</SelectItem>
                  <SelectItem value="expenses">💸 Expenses (Money Going Out)</SelectItem>
                  <SelectItem value="profit">📈 Profit (Revenue - Expenses)</SelectItem>
                  <SelectItem value="cashflow">🌊 Cash Flow (Net Money Movement)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">📅 Next 7 days</SelectItem>
                  <SelectItem value="30">📅 Next 30 days</SelectItem>
                  <SelectItem value="90">📅 Next 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={fetchForecast} className="mt-4 w-full md:w-auto" disabled={loading}>
            {loading ? "Generating Forecast..." : "Update Forecast"}
          </Button>
        </CardContent>
      </Card>

      {/* Forecast Results */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium">Generating your forecast...</p>
                <p className="text-sm text-gray-500">Analyzing your financial patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : forecastData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Forecast */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getMetricIcon(forecastData.metric)}
                {getMetricLabel(forecastData.metric)} Forecast
              </CardTitle>
              <CardDescription>Projection for the next {getPeriodLabel(forecastData.period)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Current</p>
                  <p className="text-3xl font-bold">${forecastData.currentValue.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Projected</p>
                  <p className="text-3xl font-bold text-blue-600">${forecastData.projectedValue.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
                {forecastData.trend === "up" ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
                <span
                  className={`text-lg font-medium ${forecastData.trend === "up" ? "text-green-600" : "text-red-600"}`}
                >
                  {(
                    ((forecastData.projectedValue - forecastData.currentValue) / forecastData.currentValue) *
                    100
                  ).toFixed(1)}
                  %{forecastData.trend === "up" ? " increase" : " decrease"}
                </span>
                <Badge variant="secondary" className="ml-2">
                  {forecastData.confidence}% confidence
                </Badge>
              </div>

              {/* Trend Chart */}
              <div className="h-64">
                <ChartContainer
                  config={{
                    value: {
                      label: getMetricLabel(forecastData.metric),
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData.chartData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-value)"
                        strokeWidth={3}
                        dot={{ fill: "var(--color-value)", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Timeline</span>
                </div>
                <p className="text-sm text-blue-800">
                  Based on current trends, your {forecastData.metric} is expected to reach{" "}
                  <strong>${forecastData.projectedValue.toLocaleString()}</strong> by{" "}
                  {new Date(Date.now() + Number.parseInt(period) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>💡 Insights & Recommendations</CardTitle>
              <CardDescription>What this forecast means for your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecastData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Pro Tip
                </h4>
                <p className="text-sm text-yellow-700">
                  Forecasts are based on your historical data and current trends. Keep adding expenses regularly to
                  improve accuracy! The more data we have, the better your forecasts become.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* How Forecasting Works */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>🔮 How Forecasting Works</CardTitle>
          <CardDescription>Understanding your financial predictions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2">Analyze Trends</h3>
              <p className="text-sm text-gray-600">We look at your spending and earning patterns over time</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-2">Predict Future</h3>
              <p className="text-sm text-gray-600">Using smart algorithms to project where you're heading</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-purple-600" />
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
