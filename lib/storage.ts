import type { Transaction, RecurringTransaction, Budget, Category, Settings } from "./types"

const STORAGE_KEYS = {
  TRANSACTIONS: "expense_tracker_transactions",
  RECURRING: "expense_tracker_recurring",
  BUDGETS: "expense_tracker_budgets",
  CATEGORIES: "expense_tracker_categories",
  SETTINGS: "expense_tracker_settings",
}

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Salary", type: "income", color: "#10b981" },
  { id: "2", name: "Freelance", type: "income", color: "#3b82f6" },
  { id: "3", name: "Investments", type: "income", color: "#8b5cf6" },
  { id: "4", name: "Food & Dining", type: "expense", color: "#ef4444" },
  { id: "5", name: "Transportation", type: "expense", color: "#f59e0b" },
  { id: "6", name: "Shopping", type: "expense", color: "#ec4899" },
  { id: "7", name: "Entertainment", type: "expense", color: "#06b6d4" },
  { id: "8", name: "Bills & Utilities", type: "expense", color: "#6366f1" },
  { id: "9", name: "Healthcare", type: "expense", color: "#14b8a6" },
  { id: "10", name: "Other", type: "expense", color: "#64748b" },
]

const DEFAULT_SETTINGS: Settings = {
  currency: "USD",
  theme: "light",
  dateFormat: "MM/DD/YYYY",
  defaultView: "dashboard",
}

export const storage = {
  // Transactions
  getTransactions: (): Transaction[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
    return data ? JSON.parse(data) : []
  },

  saveTransactions: (transactions: Transaction[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
  },

  addTransaction: (transaction: Transaction) => {
    const transactions = storage.getTransactions()
    transactions.push(transaction)
    storage.saveTransactions(transactions)
  },

  updateTransaction: (id: string, updates: Partial<Transaction>) => {
    const transactions = storage.getTransactions()
    const index = transactions.findIndex((t) => t.id === id)
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates }
      storage.saveTransactions(transactions)
    }
  },

  deleteTransaction: (id: string) => {
    const transactions = storage.getTransactions()
    storage.saveTransactions(transactions.filter((t) => t.id !== id))
  },

  // Recurring Transactions
  getRecurringTransactions: (): RecurringTransaction[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.RECURRING)
    return data ? JSON.parse(data) : []
  },

  saveRecurringTransactions: (recurring: RecurringTransaction[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurring))
  },

  addRecurringTransaction: (recurring: RecurringTransaction) => {
    const recurrings = storage.getRecurringTransactions()
    recurrings.push(recurring)
    storage.saveRecurringTransactions(recurrings)
  },

  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => {
    const recurrings = storage.getRecurringTransactions()
    const index = recurrings.findIndex((r) => r.id === id)
    if (index !== -1) {
      recurrings[index] = { ...recurrings[index], ...updates }
      storage.saveRecurringTransactions(recurrings)
    }
  },

  deleteRecurringTransaction: (id: string) => {
    const recurrings = storage.getRecurringTransactions()
    storage.saveRecurringTransactions(recurrings.filter((r) => r.id !== id))
  },

  // Budgets
  getBudgets: (): Budget[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS)
    return data ? JSON.parse(data) : []
  },

  saveBudgets: (budgets: Budget[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets))
  },

  addBudget: (budget: Budget) => {
    const budgets = storage.getBudgets()
    budgets.push(budget)
    storage.saveBudgets(budgets)
  },

  updateBudget: (id: string, updates: Partial<Budget>) => {
    const budgets = storage.getBudgets()
    const index = budgets.findIndex((b) => b.id === id)
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates }
      storage.saveBudgets(budgets)
    }
  },

  deleteBudget: (id: string) => {
    const budgets = storage.getBudgets()
    storage.saveBudgets(budgets.filter((b) => b.id !== id))
  },

  // Categories
  getCategories: (): Category[] => {
    if (typeof window === "undefined") return DEFAULT_CATEGORIES
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES
  },

  saveCategories: (categories: Category[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  },

  addCategory: (category: Category) => {
    const categories = storage.getCategories()
    categories.push(category)
    storage.saveCategories(categories)
  },

  updateCategory: (id: string, updates: Partial<Category>) => {
    const categories = storage.getCategories()
    const index = categories.findIndex((c) => c.id === id)
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates }
      storage.saveCategories(categories)
    }
  },

  deleteCategory: (id: string) => {
    const categories = storage.getCategories()
    storage.saveCategories(categories.filter((c) => c.id !== id))
  },

  // Settings
  getSettings: (): Settings => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return data ? JSON.parse(data) : DEFAULT_SETTINGS
  },

  saveSettings: (settings: Settings) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  },

  // Utility
  clearAllData: () => {
    if (typeof window === "undefined") return
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
  },

  exportData: () => {
    return {
      transactions: storage.getTransactions(),
      recurring: storage.getRecurringTransactions(),
      budgets: storage.getBudgets(),
      categories: storage.getCategories(),
      settings: storage.getSettings(),
    }
  },

  importData: (data: any) => {
    if (data.transactions) storage.saveTransactions(data.transactions)
    if (data.recurring) storage.saveRecurringTransactions(data.recurring)
    if (data.budgets) storage.saveBudgets(data.budgets)
    if (data.categories) storage.saveCategories(data.categories)
    if (data.settings) storage.saveSettings(data.settings)
  },
}
