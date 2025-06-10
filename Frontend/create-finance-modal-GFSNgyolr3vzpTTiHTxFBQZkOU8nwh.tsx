"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { LineItem, Vendor, Customer } from "@/lib/types/finance"

interface CreateFinanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "payable" | "receivable"
  onSubmit: (data: any) => Promise<void>
}

export function CreateFinanceModal({ open, onOpenChange, type, onSubmit }: CreateFinanceModalProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedParty, setSelectedParty] = useState<Vendor | Customer | null>(null)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, rate: 0, taxCode: "TAX001", amount: 0 },
  ])
  const [terms, setTerms] = useState("Net 30")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { toast } = useToast()

  // Mock data for vendors/customers
  const mockVendors: Vendor[] = [
    { id: "v1", name: "Office Supplies Co", email: "billing@officesupplies.com", phone: "555-0101" },
    { id: "v2", name: "Tech Solutions Inc", email: "accounts@techsolutions.com", phone: "555-0102" },
  ]

  const mockCustomers: Customer[] = [
    { id: "c1", name: "ABC Corporation", email: "ap@abccorp.com", phone: "555-0201" },
    { id: "c2", name: "XYZ Ltd", email: "finance@xyzltd.com", phone: "555-0202" },
  ]

  const parties = type === "payable" ? mockVendors : mockCustomers
  const filteredParties = parties.filter(
    (party) =>
      party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, rate: 0, taxCode: "TAX001", amount: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }

    if (field === "quantity" || field === "rate") {
      updated[index].amount = updated[index].quantity * updated[index].rate
    }

    setLineItems(updated)
  }

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {}

    if (stepNumber === 1 && !selectedParty) {
      newErrors.party = `Please select a ${type === "payable" ? "vendor" : "customer"}`
    }

    if (stepNumber === 2) {
      lineItems.forEach((item, index) => {
        if (!item.description.trim()) {
          newErrors[`description_${index}`] = "Description is required"
        }
        if (item.quantity <= 0) {
          newErrors[`quantity_${index}`] = "Quantity must be greater than 0"
        }
        if (item.rate <= 0) {
          newErrors[`rate_${index}`] = "Rate must be greater than 0"
        }
      })
    }

    if (stepNumber === 3) {
      if (!date) {
        newErrors.date = "Date is required"
      }
      if (!terms) {
        newErrors.terms = "Payment terms are required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async (isDraft = false) => {
    if (!validateStep(3)) return

    setIsLoading(true)
    try {
      const data = {
        [type === "payable" ? "vendorId" : "customerId"]: selectedParty!.id,
        items: lineItems,
        terms,
        [type === "payable" ? "dueDate" : "issueDate"]: date,
        isDraft,
      }

      await onSubmit(data)

      toast({
        title: `${type === "payable" ? "Bill" : "Invoice"} ${isDraft ? "Saved as Draft" : "Created"}`,
        description: `Successfully ${isDraft ? "saved" : "created"} ${type === "payable" ? "bill" : "invoice"}.`,
      })

      onOpenChange(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isDraft ? "save" : "create"} ${type === "payable" ? "bill" : "invoice"}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedParty(null)
    setLineItems([{ description: "", quantity: 1, rate: 0, taxCode: "TAX001", amount: 0 }])
    setTerms("Net 30")
    setDate(new Date().toISOString().split("T")[0])
    setErrors({})
    setSearchTerm("")
  }

  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New {type === "payable" ? "Bill" : "Invoice"}</DialogTitle>
          <DialogDescription>
            Step {step} of 3:{" "}
            {step === 1
              ? `Select ${type === "payable" ? "Vendor" : "Customer"}`
              : step === 2
                ? "Add Line Items"
                : "Review & Submit"}
          </DialogDescription>
        </DialogHeader>

        {errors.general && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">{errors.general}</div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search {type === "payable" ? "Vendors" : "Customers"}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder={`Search ${type === "payable" ? "vendors" : "customers"}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.party && <p className="text-sm text-destructive mt-1">{errors.party}</p>}
            </div>

            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {filteredParties.map((party) => (
                <div
                  key={party.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedParty?.id === party.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                  }`}
                  onClick={() => setSelectedParty(party)}
                >
                  <div className="font-medium">{party.name}</div>
                  <div className="text-sm text-muted-foreground">{party.email}</div>
                  {party.phone && <div className="text-sm text-muted-foreground">{party.phone}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Line Items</h3>
              <Button onClick={addLineItem} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Qty</TableHead>
                    <TableHead className="w-32">Rate</TableHead>
                    <TableHead className="w-32">Tax Code</TableHead>
                    <TableHead className="w-32">Amount</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(index, "description", e.target.value)}
                          placeholder="Item description"
                          className={errors[`description_${index}`] ? "border-destructive" : ""}
                        />
                        {errors[`description_${index}`] && (
                          <p className="text-xs text-destructive mt-1">{errors[`description_${index}`]}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, "quantity", Number.parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className={errors[`quantity_${index}`] ? "border-destructive" : ""}
                        />
                        {errors[`quantity_${index}`] && (
                          <p className="text-xs text-destructive mt-1">{errors[`quantity_${index}`]}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateLineItem(index, "rate", Number.parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className={errors[`rate_${index}`] ? "border-destructive" : ""}
                        />
                        {errors[`rate_${index}`] && (
                          <p className="text-xs text-destructive mt-1">{errors[`rate_${index}`]}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select value={item.taxCode} onValueChange={(value) => updateLineItem(index, "taxCode", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TAX001">Standard (10%)</SelectItem>
                            <SelectItem value="TAX002">Reduced (5%)</SelectItem>
                            <SelectItem value="TAX003">Exempt (0%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="font-medium">${item.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {lineItems.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeLineItem(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <div className="text-lg font-semibold">Total: ${totalAmount.toFixed(2)}</div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">{type === "payable" ? "Due Date" : "Issue Date"}</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={errors.date ? "border-destructive" : ""}
                />
                {errors.date && <p className="text-sm text-destructive mt-1">{errors.date}</p>}
              </div>

              <div>
                <Label htmlFor="terms">Payment Terms</Label>
                <Select value={terms} onValueChange={setTerms}>
                  <SelectTrigger className={errors.terms ? "border-destructive" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  </SelectContent>
                </Select>
                {errors.terms && <p className="text-sm text-destructive mt-1">{errors.terms}</p>}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{type === "payable" ? "Vendor" : "Customer"}:</span>
                  <span>{selectedParty?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{lineItems.length}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step === 3 && (
              <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isLoading}>
                Save as Draft
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={() => handleSubmit(false)} disabled={isLoading}>
                {isLoading ? "Creating..." : `Create ${type === "payable" ? "Bill" : "Invoice"}`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
