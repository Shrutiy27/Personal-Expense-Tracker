"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { Budget, Category } from "@/lib/types"
import { generateId, getMonthKey } from "@/lib/utils-expense"

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (budget: Budget) => void
  categories: Category[]
  editingBudget?: Budget | null
}

export function BudgetForm({ open, onOpenChange, onSubmit, categories, editingBudget }: BudgetFormProps) {
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [month, setMonth] = useState(getMonthKey(new Date()))
  const [alertThreshold, setAlertThreshold] = useState("80")

  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category)
      setAmount(editingBudget.amount.toString())
      setMonth(editingBudget.month)
      setAlertThreshold(editingBudget.alertThreshold.toString())
    } else {
      resetForm()
    }
  }, [editingBudget, open])

  const resetForm = () => {
    setCategory("")
    setAmount("")
    setMonth(getMonthKey(new Date()))
    setAlertThreshold("80")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const budget: Budget = {
      id: editingBudget?.id || generateId(),
      category,
      amount: Number.parseFloat(amount),
      month,
      alertThreshold: Number.parseInt(alertThreshold),
    }

    onSubmit(budget)
    resetForm()
    onOpenChange(false)
  }

  const expenseCategories = categories.filter((c) => c.type === "expense")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingBudget ? "Edit Budget" : "Create Budget"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input id="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Alert Threshold (%)</Label>
            <Input
              id="threshold"
              type="number"
              min="1"
              max="100"
              placeholder="80"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Get notified when spending reaches this percentage of your budget
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingBudget ? "Update" : "Create"} Budget</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
