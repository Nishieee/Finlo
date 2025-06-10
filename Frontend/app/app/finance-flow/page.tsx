"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Plus, TrendingUp, TrendingDown, Filter } from "lucide-react"
import { DraggableSplitter } from "@/draggable-splitter-KtpE9y1rIomvpyWmQl4hK0NmJWPUTm"
import { AgingBarChart, AgingDonutChart } from "@/aging-chart-MNH7GcApFVhAoURwDcFhKCZ5rvVAj1"
import { FinanceTable } from "@/finance-table-kzq7mLZjNcnvNewvubhVjDkS6wisQ1"
import { InsightsSidebar } from "@/insights-sidebar-f0XkEg9ggkgHRUsS7pSlVrIC2EFO25"
import { CreateFinanceModal } from "@/create-finance-modal-GFSNgyolr3vzpTTiHTxFBQZkOU8nwh"
import type { FinanceFlowData, AgingBucket } from "@/lib/types/finance"
import { useToast } from "@/hooks/use-toast"

export default function FinanceFlowPage() {
  const [data, setData] = useState<FinanceFlowData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [financeBasis, setFinanceBasis] = useState<"accrual" | "cash">("accrual")
  const [selectedPayableIds, setSelectedPayableIds] = useState<string[]>([])
  const [selectedReceivableIds, setSelectedReceivableIds] = useState<string[]>([])
  const [filterBucket, setFilterBucket] = useState<string>("")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createModalType, setCreateModalType] = useState<"payable" | "receivable">("payable")
  const [splitterPosition, setSplitterPosition] = useState(50)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState("payables")

  const { toast } = useToast()

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Load user preferences and data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Mock data for now
        const mockData: FinanceFlowData = {
          totalPayables: 45000,
          totalReceivables: 78000,
          payables: [],
          receivables: [],
          payableAging: [
            { label: "0-30 days", amount: 15000, count: 5, percentage: 45, range: "0-30" },
            { label: "31-60 days", amount: 8000, count: 3, percentage: 24, range: "31-60" },
            { label: "61-90 days", amount: 6000, count: 2, percentage: 18, range: "61-90" },
            { label: "90+ days", amount: 4000, count: 1, percentage: 13, range: "90+" },
          ],
          receivableAging: [
            { label: "0-30 days", amount: 25000, count: 8, percentage: 55, range: "0-30" },
            { label: "31-60 days", amount: 12000, count: 4, percentage: 25, range: "31-60" },
            { label: "61-90 days", amount: 8000, count: 2, percentage: 15, range: "61-90" },
            { label: "90+ days", amount: 3000, count: 1, percentage: 5, range: "90+" },
          ],
          insights: {
            avgPaymentTime: 32,
            dso: 28,
            topOverdueVendors: [],
            topCustomers: [],
          },
        }
        setData(mockData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load finance data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Handle basis change
  const handleBasisChange = useCallback(
    async (newBasis: "accrual" | "cash") => {
      setFinanceBasis(newBasis)
      // In a real app, this would reload data
    },
    [toast],
  )

  // Handle bucket click for filtering
  const handleBucketClick = useCallback(
    (bucket: AgingBucket) => {
      setFilterBucket(filterBucket === bucket.range ? "" : bucket.range)
    },
    [filterBucket],
  )

  // Handle bulk actions
  const handlePayableBulkAction = useCallback(
    async (action: "markPaid" | "export", ids: string[]) => {
      toast({
        title: "Success",
        description: `${action === "markPaid" ? "Bills marked as paid" : "Export started"}`,
      })
    },
    [toast],
  )

  const handleReceivableBulkAction = useCallback(
    async (action: "markPaid" | "export", ids: string[]) => {
      toast({
        title: "Success",
        description: `${action === "markPaid" ? "Invoices marked as paid" : "Export started"}`,
      })
    },
    [toast],
  )

  // Handle create submission
  const handleCreateSubmit = useCallback(async (formData: any) => {
    // Mock implementation
    console.log("Creating:", formData)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600">Please refresh the page to try again.</p>
        </div>
      </div>
    )
  }

  // Mobile accordion view
  if (isMobile) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Finance Flow</h1>
          <ToggleGroup
            type="single"
            value={financeBasis}
            onValueChange={(value) => value && handleBasisChange(value as "accrual" | "cash")}
            className="border rounded-lg"
          >
            <ToggleGroupItem value="accrual" className="text-sm">
              Accrual
            </ToggleGroupItem>
            <ToggleGroupItem value="cash" className="text-sm">
              Cash
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payables">Payables</TabsTrigger>
            <TabsTrigger value="receivables">Receivables</TabsTrigger>
          </TabsList>

          <TabsContent value="payables" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">Accounts Payable</CardTitle>
                  <CardDescription>{formatCurrency(data.totalPayables)} outstanding</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setCreateModalType("payable")
                    setCreateModalOpen(true)
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Bill
                </Button>
              </CardHeader>
              <CardContent>
                <AgingBarChart data={data.payableAging} onBucketClick={handleBucketClick} />
              </CardContent>
            </Card>

            <FinanceTable
              data={data.payables}
              type="payables"
              selectedIds={selectedPayableIds}
              onSelectionChange={setSelectedPayableIds}
              onBulkAction={handlePayableBulkAction}
              filterBucket={filterBucket}
            />

            <InsightsSidebar insights={data.insights} type="payables" />
          </TabsContent>

          <TabsContent value="receivables" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">Accounts Receivable</CardTitle>
                  <CardDescription>{formatCurrency(data.totalReceivables)} outstanding</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setCreateModalType("receivable")
                    setCreateModalOpen(true)
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Invoice
                </Button>
              </CardHeader>
              <CardContent>
                <AgingDonutChart data={data.receivableAging} onBucketClick={handleBucketClick} />
              </CardContent>
            </Card>

            <FinanceTable
              data={data.receivables}
              type="receivables"
              selectedIds={selectedReceivableIds}
              onSelectionChange={setSelectedReceivableIds}
              onBulkAction={handleReceivableBulkAction}
              filterBucket={filterBucket}
            />

            <InsightsSidebar insights={data.insights} type="receivables" />
          </TabsContent>
        </Tabs>

        <CreateFinanceModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          type={createModalType}
          onSubmit={handleCreateSubmit}
        />
      </div>
    )
  }

  // Desktop split view
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Flow</h1>
          <p className="text-gray-600">Manage your accounts payable and receivable</p>
        </div>
        <ToggleGroup
          type="single"
          value={financeBasis}
          onValueChange={(value) => value && handleBasisChange(value as "accrual" | "cash")}
          className="border rounded-lg"
        >
          <ToggleGroupItem value="accrual">Accrual</ToggleGroupItem>
          <ToggleGroupItem value="cash">Cash</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Accounts Payable Panel */}
        <section
          className="absolute inset-y-0 left-0 bg-background border-r overflow-y-auto"
          style={{ width: `${splitterPosition}%` }}
        >
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Accounts Payable</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-bold">{formatCurrency(data.totalPayables)}</span>
                  <Badge variant="secondary">
                    {data.payables.filter((p) => p.status === "overdue").length} overdue
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => {
                  setCreateModalType("payable")
                  setCreateModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Bill
              </Button>
            </div>

            {/* Aging Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Aging Summary
                </CardTitle>
                <CardDescription>Click a bucket to filter the table below</CardDescription>
              </CardHeader>
              <CardContent>
                <AgingBarChart data={data.payableAging} onBucketClick={handleBucketClick} />
                {filterBucket && (
                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant="outline">
                      <Filter className="h-3 w-3 mr-1" />
                      Filtered by: {filterBucket} days
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setFilterBucket("")}>
                      Clear filter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payables Table */}
            <FinanceTable
              data={data.payables}
              type="payables"
              selectedIds={selectedPayableIds}
              onSelectionChange={setSelectedPayableIds}
              onBulkAction={handlePayableBulkAction}
              filterBucket={filterBucket}
            />
          </div>
        </section>

        {/* Draggable Splitter */}
        <DraggableSplitter
          direction="horizontal"
          initialPosition={50}
          minPosition={30}
          maxPosition={70}
          onPositionChange={setSplitterPosition}
          storageKey="finance-flow-splitter"
        />

        {/* Accounts Receivable Panel */}
        <section
          className="absolute inset-y-0 right-0 bg-background overflow-y-auto"
          style={{ width: `${100 - splitterPosition}%` }}
        >
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Accounts Receivable</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-bold">{formatCurrency(data.totalReceivables)}</span>
                  <Badge variant="secondary">
                    {data.receivables.filter((r) => r.status === "overdue").length} overdue
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => {
                  setCreateModalType("receivable")
                  setCreateModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </div>

            {/* Aging Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Aging Summary
                </CardTitle>
                <CardDescription>Distribution of outstanding invoices by age</CardDescription>
              </CardHeader>
              <CardContent>
                <AgingDonutChart data={data.receivableAging} onBucketClick={handleBucketClick} />
              </CardContent>
            </Card>

            {/* Receivables Table */}
            <FinanceTable
              data={data.receivables}
              type="receivables"
              selectedIds={selectedReceivableIds}
              onSelectionChange={setSelectedReceivableIds}
              onBulkAction={handleReceivableBulkAction}
              onSendReminder={(id) => {
                toast({
                  title: "Reminder Sent",
                  description: "Payment reminder email has been sent to the customer.",
                })
              }}
              onRecordPayment={(id) => {
                toast({
                  title: "Payment Recorded",
                  description: "Payment has been recorded for this invoice.",
                })
              }}
              filterBucket={filterBucket}
            />
          </div>
        </section>
      </div>

      {/* Create Modal */}
      <CreateFinanceModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        type={createModalType}
        onSubmit={handleCreateSubmit}
      />
    </div>
  )
}
