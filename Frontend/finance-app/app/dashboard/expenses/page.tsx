"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, Plus } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Expense {
  id: string
  date: string
  amount: number
  description: string
  category: string
  paymentMethod: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      // Replace with actual API call
      // const response = await fetch('https://your-backend-url.com/expenses/')
      // const data = await response.json()

      // Mock data for demonstration
      const mockExpenses: Expense[] = [
        {
          id: "1",
          date: "2024-01-15",
          amount: 150,
          description: "Office supplies",
          category: "Office & Admin",
          paymentMethod: "Credit Card",
        },
        {
          id: "2",
          date: "2024-01-14",
          amount: 500,
          description: "Marketing ads",
          category: "Marketing",
          paymentMethod: "Credit Card",
        },
        {
          id: "3",
          date: "2024-01-13",
          amount: 99,
          description: "Software subscription",
          category: "Software",
          paymentMethod: "Credit Card",
        },
        {
          id: "4",
          date: "2024-01-12",
          amount: 75,
          description: "Gas for delivery",
          category: "Transportation",
          paymentMethod: "Cash",
        },
        {
          id: "5",
          date: "2024-01-11",
          amount: 200,
          description: "Flowers for shop",
          category: "Inventory",
          paymentMethod: "Debit Card",
        },
      ]

      setExpenses(mockExpenses)
    } catch (error) {
      console.error("Error fetching expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      // Replace with actual API call
      // await fetch(`https://your-backend-url.com/expenses/${id}`, { method: 'DELETE' })

      setExpenses(expenses.filter((expense) => expense.id !== id))
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  const handleEdit = async (expense: Expense) => {
    try {
      // Replace with actual API call
      // await fetch(`https://your-backend-url.com/expenses/${expense.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(expense)
      // })

      setExpenses(expenses.map((e) => (e.id === expense.id ? expense : e)))
      setEditingExpense(null)
    } catch (error) {
      console.error("Error updating expense:", error)
    }
  }

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Expenses</h1>
          <p className="text-gray-600">
            Total: ${totalExpenses.toLocaleString()} • {expenses.length} expenses
          </p>
        </div>
        <Link href="/dashboard/add-expense">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search expenses by description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>Review, edit, or delete your business expenses</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{searchTerm ? "No expenses match your search." : "No expenses yet."}</p>
              {!searchTerm && (
                <Link href="/dashboard/add-expense">
                  <Button className="mt-4">Add Your First Expense</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{expense.category}</Badge>
                      </TableCell>
                      <TableCell>{expense.paymentMethod}</TableCell>
                      <TableCell className="text-right font-medium">${expense.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingExpense(expense)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Expense</DialogTitle>
                                <DialogDescription>Make changes to your expense details.</DialogDescription>
                              </DialogHeader>
                              {editingExpense && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                      id="description"
                                      value={editingExpense.description}
                                      onChange={(e) =>
                                        setEditingExpense({
                                          ...editingExpense,
                                          description: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                      id="amount"
                                      type="number"
                                      value={editingExpense.amount}
                                      onChange={(e) =>
                                        setEditingExpense({
                                          ...editingExpense,
                                          amount: Number.parseFloat(e.target.value) || 0,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                      id="category"
                                      value={editingExpense.category}
                                      onChange={(e) =>
                                        setEditingExpense({
                                          ...editingExpense,
                                          category: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingExpense(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={() => editingExpense && handleEdit(editingExpense)}>
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
