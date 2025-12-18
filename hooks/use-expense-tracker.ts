"use client"

import { useState, useEffect, useCallback } from "react"
import { storage } from "@/lib/storage"
import { generateRecurringTransactions } from "@/lib/utils-expense"
import type { Transaction, RecurringTransaction, Budget, Category, Settings } from "@/lib/types"

export function useExpenseTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      setTransactions(storage.getTransactions())
      setRecurring(storage.getRecurringTransactions())
      setBudgets(storage.getBudgets())
      setCategories(storage.getCategories())
      setSettings(storage.getSettings())
      setIsLoading(false)
    }

    loadData()

    // Generate recurring transactions on mount
    const generated = generateRecurringTransactions()
    if (generated.length > 0) {
      generated.forEach((t) => storage.addTransaction(t))
      setTransactions(storage.getTransactions())
    }
  }, [])

  // Transactions
  const addTransaction = useCallback((transaction: Transaction) => {
    storage.addTransaction(transaction)
    setTransactions(storage.getTransactions())
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    storage.updateTransaction(id, updates)
    setTransactions(storage.getTransactions())
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    storage.deleteTransaction(id)
    setTransactions(storage.getTransactions())
  }, [])

  // Recurring
  const addRecurring = useCallback((r: RecurringTransaction) => {
    storage.addRecurringTransaction(r)
    setRecurring(storage.getRecurringTransactions())
  }, [])

  const updateRecurring = useCallback((id: string, updates: Partial<RecurringTransaction>) => {
    storage.updateRecurringTransaction(id, updates)
    setRecurring(storage.getRecurringTransactions())
  }, [])

  const deleteRecurring = useCallback((id: string) => {
    storage.deleteRecurringTransaction(id)
    setRecurring(storage.getRecurringTransactions())
  }, [])

  // Budgets
  const addBudget = useCallback((budget: Budget) => {
    storage.addBudget(budget)
    setBudgets(storage.getBudgets())
  }, [])

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    storage.updateBudget(id, updates)
    setBudgets(storage.getBudgets())
  }, [])

  const deleteBudget = useCallback((id: string) => {
    storage.deleteBudget(id)
    setBudgets(storage.getBudgets())
  }, [])

  // Categories
  const addCategory = useCallback((category: Category) => {
    storage.addCategory(category)
    setCategories(storage.getCategories())
  }, [])

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    storage.updateCategory(id, updates)
    setCategories(storage.getCategories())
  }, [])

  const deleteCategory = useCallback((id: string) => {
    storage.deleteCategory(id)
    setCategories(storage.getCategories())
  }, [])

  // Settings
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    const newSettings = { ...storage.getSettings(), ...updates }
    storage.saveSettings(newSettings)
    setSettings(newSettings)
  }, [])

  return {
    transactions,
    recurring,
    budgets,
    categories,
    settings,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    addBudget,
    updateBudget,
    deleteBudget,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
  }
}
