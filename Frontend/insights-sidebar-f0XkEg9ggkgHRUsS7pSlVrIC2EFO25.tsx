"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronDown, TrendingUp, Clock, Users } from "lucide-react"
import type { FinanceInsights } from "@/lib/types/finance"

interface InsightsSidebarProps {
  insights: FinanceInsights
  type: "payables" | "receivables"
  className?: string
}

export function InsightsSidebar({ insights, type, className }: InsightsSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (isCollapsed) {
    return (
      <div className={className}>
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(false)} className="w-full justify-start">
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Expand insights</span>
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Insights</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(true)}>
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Collapse insights</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {type === "payables" ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">Average Payment Time</h4>
                </div>
                <div className="text-2xl font-bold">{insights.avgPaymentTime} days</div>
                <p className="text-sm text-muted-foreground">Industry average: 35 days</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">Top Overdue Vendors</h4>
                </div>
                <div className="space-y-2">
                  {insights.topOverdueVendors.map((vendor, index) => (
                    <div key={vendor.vendor.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium text-sm">{vendor.vendor.name}</div>
                        <div className="text-xs text-muted-foreground">{vendor.daysPastDue} days overdue</div>
                      </div>
                      <Badge variant="destructive">{formatCurrency(vendor.amount)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">Days Sales Outstanding</h4>
                </div>
                <div className="text-2xl font-bold">{insights.dso} days</div>
                <p className="text-sm text-muted-foreground">Target: ≤ 30 days</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium">Top Customers by Balance</h4>
                </div>
                <div className="space-y-2">
                  {insights.topCustomers.map((customer, index) => (
                    <div key={customer.customer.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium text-sm">{customer.customer.name}</div>
                        <div className="text-xs text-muted-foreground">Outstanding balance</div>
                      </div>
                      <Badge variant="secondary">{formatCurrency(customer.amount)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
