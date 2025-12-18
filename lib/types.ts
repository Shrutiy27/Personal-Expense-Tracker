export type TransactionType = "income" | "expense"

export interface Category {
  id: string
  name: string
  type: TransactionType
  color: string
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category: string
  description: string
  date: string
  isRecurring: boolean
  recurringId?: string
}

export interface RecurringTransaction {
  id: string
  amount: number
  type: TransactionType
  category: string
  description: string
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  startDate: string
  endDate?: string
  lastGenerated?: string
  isActive: boolean
}

export interface Budget {
  id: string
  category: string
  amount: number
  month: string // YYYY-MM format
  alertThreshold: number // percentage (0-100)
}

export interface Settings {
  currency: string
  theme: "light" | "dark"
  dateFormat: string
  defaultView: "transactions" | "dashboard" | "budgets"
}

export interface MonthlyReport {
  month: string
  totalIncome: number
  totalExpense: number
  balance: number
  categoryBreakdown: {
    category: string
    amount: number
    percentage: number
  }[]
}
