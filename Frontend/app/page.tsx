import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, MessageSquare, TrendingUp, Users, ArrowRight, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Manage Your Business Finances
              <span className="text-blue-600"> in Plain English</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              No accounting degree needed! Just type what you spent like{" "}
              <span className="font-semibold text-blue-600">"bought supplies for $75"</span> and we'll handle the rest.
              Track expenses, forecast cash flow, and grow your business with confidence.
            </p>
          </div>

          {/* Demo Input Preview */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">💬 Just type naturally:</label>
                <div className="bg-gray-50 rounded-md p-4 text-gray-500 italic border-2 border-dashed border-gray-300">
                  "Spent $200 on flowers for the shop"
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Automatically categorized as: Inventory • $200 • Cash
                </div>
              </div>
            </div>
          </div>

          <Link href="/app">
            <Button size="lg" className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700">
              Get Started - It's Free!
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Natural Language</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Just type "spent $200 on flowers" - no forms or categories to worry about
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-green-200 transition-colors">
            <CardHeader>
              <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Smart Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Automatically categorizes and organizes your expenses for easy review</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-purple-200 transition-colors">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Cash Flow Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                See where your money is going and plan for the future with simple forecasts
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-orange-200 transition-colors">
            <CardHeader>
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Built for Small Business</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Designed by small business owners, for small business owners</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Type Your Expense</h3>
              <p className="text-gray-600">"Paid $150 for electricity" or "Bought office supplies for $75 with card"</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">We Organize It</h3>
              <p className="text-gray-600">Automatically categorized and added to your financial records</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">See Your Progress</h3>
              <p className="text-gray-600">View dashboards, forecasts, and insights to grow your business</p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center bg-blue-50 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Join Thousands of Small Business Owners</h2>
          <p className="text-gray-600 mb-6">Who've simplified their bookkeeping and gained financial clarity</p>
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              No accounting knowledge required
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Setup in under 2 minutes
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Free to get started
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
          <p className="text-gray-600 mb-6">Start tracking your business expenses the easy way</p>
          <Link href="/app">
            <Button size="lg" className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700">
              Start Managing Your Money Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
