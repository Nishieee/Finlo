"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Mail, DollarSign, FileText, Download } from "lucide-react"
import type { Payable, Receivable } from "@/lib/types/finance"

interface FinanceTableProps {
  data: (Payable | Receivable)[]
  type: "payables" | "receivables"
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onBulkAction: (action: "markPaid" | "export", ids: string[]) => void
  onSendReminder?: (id: string) => void
  onRecordPayment?: (id: string) => void
  filterBucket?: string
}

export function FinanceTable({
  data,
  type,
  selectedIds,
  onSelectionChange,
  onBulkAction,
  onSendReminder,
  onRecordPayment,
  filterBucket,
}: FinanceTableProps) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)

  const filteredData = useMemo(() => {
    if (!filterBucket) return data

    const now = new Date()
    return data.filter((item) => {
      const dueDate = new Date(type === "payables" ? (item as Payable).dueDate : (item as Receivable).dueDate)
      const daysDiff = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

      switch (filterBucket) {
        case "0-30":
          return daysDiff >= -30 && daysDiff <= 0
        case "31-60":
          return daysDiff >= -60 && daysDiff < -30
        case "61-90":
          return daysDiff >= -90 && daysDiff < -60
        case "90+":
          return daysDiff < -90
        default:
          return true
      }
    })
  }, [data, filterBucket, type])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(filteredData.map((item) => item.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id])
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id))
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "default",
      unpaid: "secondary",
      overdue: "destructive",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <Button size="sm" variant="outline" onClick={() => onBulkAction("markPaid", selectedIds)}>
            <DollarSign className="h-4 w-4 mr-1" />
            Mark as Paid
          </Button>
          <Button size="sm" variant="outline" onClick={() => onBulkAction("export", selectedIds)}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>{type === "payables" ? "Vendor" : "Customer"}</TableHead>
              <TableHead>{type === "payables" ? "Due Date" : "Issue Date"}</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                    aria-label={`Select ${item.invoiceNumber}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                <TableCell>
                  {type === "payables" ? (item as Payable).vendor.name : (item as Receivable).customer.name}
                </TableCell>
                <TableCell>
                  {editingCell?.id === item.id && editingCell?.field === "date" ? (
                    <Input
                      type="date"
                      defaultValue={type === "payables" ? (item as Payable).dueDate : (item as Receivable).issueDate}
                      onBlur={() => setEditingCell(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingCell(null)
                      }}
                      className="w-32"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => setEditingCell({ id: item.id, field: "date" })}
                      className="text-left hover:bg-muted p-1 rounded"
                    >
                      {formatDate(type === "payables" ? (item as Payable).dueDate : (item as Receivable).issueDate)}
                    </button>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(item.amount)}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {type === "receivables" && (
                        <>
                          <DropdownMenuItem onClick={() => onSendReminder?.(item.id)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRecordPayment?.(item.id)}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Record Payment
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
