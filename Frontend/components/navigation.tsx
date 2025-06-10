"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, BarChart3, Receipt, TrendingUp, Menu, X, DollarSign, MessageSquare, ArrowLeft } from "lucide-react"

const navigation = [
  { name: "Home", href: "/app", icon: Home, description: "Add expenses & quick overview" },
  { name: "Dashboard", href: "/app/dashboard", icon: BarChart3, description: "Financial overview & charts" },
  { name: "Expenses", href: "/app/expenses", icon: Receipt, description: "View & manage all expenses" },
  { name: "Forecast", href: "/app/forecast", icon: TrendingUp, description: "Financial predictions" },
  { name: "Finance Flow", href: "/app/finance-flow", icon: DollarSign, description: "Advanced AP/AR management" },
]

export function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-sm">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4 mb-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-blue-600 rounded-lg p-2">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-blue-600">FinanceEasy</h1>
                  <p className="text-xs text-gray-500">Simple Business Finance</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 border-blue-500 text-blue-700 border-l-4 ml-0 pl-3"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent",
                    )}
                  >
                    <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Back to Landing */}
            <div className="px-2 mt-4">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>Need help?</p>
              <Link href="#" className="text-blue-600 hover:underline">
                Check our quick guide
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-blue-600">FinanceEasy</h1>
          </Link>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 rounded-lg p-2">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-blue-600">FinanceEasy</h1>
                      <p className="text-xs text-gray-500">Simple Business Finance</p>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                          isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                        </div>
                      </Link>
                    )
                  })}
                </nav>

                <div className="p-4 border-t">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-600">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
