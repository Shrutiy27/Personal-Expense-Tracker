import type { Transaction, Category, Budget, MonthlyReport } from "./types"
import { storage } from "./storage"

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatDate(date: string, format = "MM/DD/YYYY"): string {
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const year = d.getFullYear()

  switch (format) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`
    default:
      return `${month}/${day}/${year}`
  }
}

export function getMonthKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function getCategoryName(categoryId: string, categories: Category[]): string {
  return categories.find((c) => c.id === categoryId)?.name || "Unknown"
}

export function getCategoryColor(categoryId: string, categories: Category[]): string {
  return categories.find((c) => c.id === categoryId)?.color || "#64748b"
}

export function calculateMonthlyReport(
  transactions: Transaction[],
  month: string,
  categories: Category[],
): MonthlyReport {
  const monthTransactions = transactions.filter((t) => getMonthKey(t.date) === month)

  const totalIncome = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const categoryTotals = new Map<string, number>()
  monthTransactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount)
    })

  const categoryBreakdown = Array.from(categoryTotals.entries()).map(([categoryId, amount]) => ({
    category: getCategoryName(categoryId, categories),
    amount,
    percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
  }))

  return {
    month,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categoryBreakdown,
  }
}

export function checkBudgetAlert(
  budget: Budget,
  spent: number,
): {
  isOverBudget: boolean
  isNearLimit: boolean
  percentage: number
} {
  const percentage = (spent / budget.amount) * 100
  return {
    isOverBudget: percentage > 100,
    isNearLimit: percentage >= budget.alertThreshold && percentage <= 100,
    percentage,
  }
}

export function generateRecurringTransactions(): Transaction[] {
  const recurring = storage.getRecurringTransactions()
  const now = new Date()
  const generated: Transaction[] = []

  recurring.forEach((r) => {
    if (!r.isActive) return

    const lastGenerated = r.lastGenerated ? new Date(r.lastGenerated) : new Date(r.startDate)
    const endDate = r.endDate ? new Date(r.endDate) : null

    if (endDate && now > endDate) {
      storage.updateRecurringTransaction(r.id, { isActive: false })
      return
    }

    const nextDate = new Date(lastGenerated)

    while (nextDate <= now) {
      switch (r.frequency) {
        case "daily":
          nextDate.setDate(nextDate.getDate() + 1)
          break
        case "weekly":
          nextDate.setDate(nextDate.getDate() + 7)
          break
        case "monthly":
          nextDate.setMonth(nextDate.getMonth() + 1)
          break
        case "yearly":
          nextDate.setFullYear(nextDate.getFullYear() + 1)
          break
      }

      if (nextDate > now) break
      if (endDate && nextDate > endDate) break

      const transaction: Transaction = {
        id: generateId(),
        amount: r.amount,
        type: r.type,
        category: r.category,
        description: `${r.description} (Recurring)`,
        date: nextDate.toISOString().split("T")[0],
        isRecurring: true,
        recurringId: r.id,
      }

      generated.push(transaction)
    }

    if (generated.length > 0) {
      storage.updateRecurringTransaction(r.id, {
        lastGenerated: now.toISOString().split("T")[0],
      })
    }
  })

  return generated
}

export function exportToCSV(transactions: Transaction[], categories: Category[]): string {
  const headers = ["Date", "Type", "Category", "Description", "Amount"]
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    getCategoryName(t.category, categories),
    t.description,
    t.amount.toString(),
  ])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

export function exportToJSON(data: any): string {
  return JSON.stringify(data, null, 2)
}

export function parseCSV(csv: string): Partial<Transaction>[] {
  const lines = csv.split("\n").filter((line) => line.trim())
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

  return lines.slice(1).map((line) => {
    const values = line.split(",")
    const obj: any = {}

    headers.forEach((header, i) => {
      const value = values[i]?.trim()
      if (header === "amount") obj.amount = Number.parseFloat(value)
      else if (header === "type") obj.type = value
      else if (header === "date") obj.date = value
      else if (header === "description") obj.description = value
      else if (header === "category") obj.categoryName = value
    })

    return obj
  })
}
