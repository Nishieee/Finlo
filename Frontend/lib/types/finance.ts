export interface Vendor {
  id: string
  name: string
  email: string
  phone?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
}

export interface LineItem {
  description: string
  quantity: number
  rate: number
  taxCode: string
  amount: number
}

export interface Payable {
  id: string
  invoiceNumber: string
  vendor: Vendor
  amount: number
  dueDate: string
  status: "paid" | "unpaid" | "overdue"
  items?: LineItem[]
}

export interface Receivable {
  id: string
  invoiceNumber: string
  customer: Customer
  amount: number
  issueDate: string
  dueDate: string
  status: "paid" | "unpaid" | "overdue"
  items?: LineItem[]
}

export interface AgingBucket {
  label: string
  amount: number
  count: number
  percentage: number
}

export interface FinanceInsights {
  avgPaymentTime: number
  dso: number
  topOverdueVendors: Array<{
    vendor: Vendor
    amount: number
    daysPastDue: number
  }>
  topCustomers: Array<{
    customer: Customer
    amount: number
  }>
}
