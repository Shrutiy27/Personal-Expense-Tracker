"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import type { RecurringTransaction, Category, TransactionType } from "@/lib/types"
import { generateId } from "@/lib/utils-expense"

interface RecurringFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (recurring: RecurringTransaction) => void
  categories: Category[]
  editingRecurring?: RecurringTransaction | null
}

export function RecurringForm({ open, onOpenChange, onSubmit, categories, editingRecurring }: RecurringFormProps) {
  const [type, setType] = useState<TransactionType>("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [hasEndDate, setHasEndDate] = useState(false)
  const [endDate, setEndDate] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (editingRecurring) {
      setType(editingRecurring.type)
      setAmount(editingRecurring.amount.toString())
      setCategory(editingRecurring.category)
      setDescription(editingRecurring.description)
      setFrequency(editingRecurring.frequency)
      setStartDate(editingRecurring.startDate)
      setHasEndDate(!!editingRecurring.endDate)
      setEndDate(editingRecurring.endDate || "")
      setIsActive(editingRecurring.isActive)
    } else {
      resetForm()
    }
  }, [editingRecurring, open])

  const resetForm = () => {
    setType("expense")
    setAmount("")
    setCategory("")
    setDescription("")
    setFrequency("monthly")
    setStartDate(new Date().toISOString().split("T")[0])
    setHasEndDate(false)
    setEndDate("")
    setIsActive(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const recurring: RecurringTransaction = {
      id: editingRecurring?.id || generateId(),
      amount: Number.parseFloat(amount),
      type,
      category,
      description,
      frequency,
      startDate,
      endDate: hasEndDate ? endDate : undefined,
      isActive,
      lastGenerated: editingRecurring?.lastGenerated,
    }

    onSubmit(recurring)
    resetForm()
    onOpenChange(false)
  }

  const filteredCategories = categories.filter((c) => c.type === type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingRecurring ? "Edit Recurring Transaction" : "Add Recurring Transaction"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
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
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="hasEndDate" checked={hasEndDate} onCheckedChange={(checked) => setHasEndDate(!!checked)} />
              <Label htmlFor="hasEndDate" className="cursor-pointer">
                Set end date
              </Label>
            </div>
            {hasEndDate && (
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isActive" checked={isActive} onCheckedChange={(checked) => setIsActive(!!checked)} />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingRecurring ? "Update" : "Add"} Recurring</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
