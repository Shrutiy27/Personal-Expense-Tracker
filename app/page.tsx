"use client"

import { useState, useMemo } from "react"
import { Plus, LayoutDashboard, Receipt, Wallet, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionList } from "@/components/transaction-list"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionFilters, type FilterState } from "@/components/transaction-filters"
import { BudgetCard } from "@/components/budget-card"
import { BudgetForm } from "@/components/budget-form"
import { RecurringList } from "@/components/recurring-list"
import { RecurringForm } from "@/components/recurring-form"
import { DashboardOverview } from "@/components/dashboard-overview"
import { ExpenseChart } from "@/components/expense-chart"
import { CategoryBreakdown } from "@/components/category-breakdown"
import { ImportExportDialog } from "@/components/import-export-dialog"
import { SettingsDialog } from "@/components/settings-dialog"
import { useExpenseTracker } from "@/hooks/use-expense-tracker"
import { getMonthKey } from "@/lib/utils-expense"
import type { Transaction, Budget, RecurringTransaction } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ExpenseTrackerApp() {
  const {
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
    updateSettings,
  } = useExpenseTracker()

  const [activeTab, setActiveTab] = useState("dashboard")
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)
  const [budgetFormOpen, setBudgetFormOpen] = useState(false)
  const [recurringFormOpen, setRecurringFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    category: "",
    dateFrom: "",
    dateTo: "",
  })
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()))

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.type !== "all" && t.type !== filters.type) {
        return false
      }
      if (filters.category && filters.category !== "all" && t.category !== filters.category) {
        return false
      }
      if (filters.dateFrom && t.date < filters.dateFrom) {
        return false
      }
      if (filters.dateTo && t.date > filters.dateTo) {
        return false
      }
      return true
    })
  }, [transactions, filters])

  const monthBudgets = useMemo(() => {
    return budgets.filter((b) => b.month === selectedMonth)
  }, [budgets, selectedMonth])

  const getBudgetSpent = (budget: Budget) => {
    return transactions
      .filter((t) => t.type === "expense" && t.category === budget.category && getMonthKey(t.date) === budget.month)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const handleTransactionSubmit = (transaction: Transaction) => {
    if (editingTransaction) {
      updateTransaction(transaction.id, transaction)
      setEditingTransaction(null)
    } else {
      addTransaction(transaction)
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setTransactionFormOpen(true)
  }

  const handleBudgetSubmit = (budget: Budget) => {
    if (editingBudget) {
      updateBudget(budget.id, budget)
      setEditingBudget(null)
    } else {
      addBudget(budget)
    }
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setBudgetFormOpen(true)
  }

  const handleRecurringSubmit = (r: RecurringTransaction) => {
    if (editingRecurring) {
      updateRecurring(r.id, r)
      setEditingRecurring(null)
    } else {
      addRecurring(r)
    }
  }

  const handleEditRecurring = (r: RecurringTransaction) => {
    setEditingRecurring(r)
    setRecurringFormOpen(true)
  }

  const handleToggleRecurring = (id: string, isActive: boolean) => {
    updateRecurring(id, { isActive })
  }

  if (isLoading || !settings) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <h1 className="text-xl font-bold">Personal Expense Tracker</h1>
          </div>

          <div className="flex items-center gap-2">
            <ImportExportDialog
              transactions={transactions}
              categories={categories}
              onImport={() => {
                /* Refresh happens automatically via hook */
              }}
            />
            <SettingsDialog settings={settings} onUpdate={updateSettings} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Budgets</span>
            </TabsTrigger>
            <TabsTrigger value="recurring" className="gap-2">
              <Repeat className="h-4 w-4" />
              <span className="hidden sm:inline">Recurring</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-balance">Financial Overview</h2>
                <p className="text-muted-foreground">Track your income, expenses, and savings</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="month-select" className="text-sm">
                  Select Month
                </Label>
                <Input
                  id="month-select"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-[180px]"
                />
              </div>
            </div>

            <DashboardOverview transactions={transactions} currency={settings.currency} selectedMonth={selectedMonth} />

            <div className="grid gap-6 lg:grid-cols-2">
              <ExpenseChart transactions={transactions} currency={settings.currency} />
              <CategoryBreakdown
                transactions={transactions}
                categories={categories}
                selectedMonth={selectedMonth}
                currency={settings.currency}
              />
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-balance">Transactions</h2>
                <p className="text-muted-foreground">Manage your income and expenses</p>
              </div>
              <Button
                onClick={() => {
                  setEditingTransaction(null)
                  setTransactionFormOpen(true)
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </div>

            <TransactionFilters categories={categories} onFilterChange={setFilters} />

            <TransactionList
              transactions={filteredTransactions}
              categories={categories}
              onEdit={handleEditTransaction}
              onDelete={deleteTransaction}
              currency={settings.currency}
              dateFormat={settings.dateFormat}
            />
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-balance">Monthly Budgets</h2>
                <p className="text-muted-foreground">Set spending limits for categories</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-month" className="text-sm">
                    Month
                  </Label>
                  <Input
                    id="budget-month"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-[180px]"
                  />
                </div>
                <Button
                  onClick={() => {
                    setEditingBudget(null)
                    setBudgetFormOpen(true)
                  }}
                  className="gap-2 mt-6"
                >
                  <Plus className="h-4 w-4" />
                  Create Budget
                </Button>
              </div>
            </div>

            {monthBudgets.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No budgets for this month</h3>
                <p className="text-muted-foreground mb-4">Create a budget to start tracking your spending</p>
                <Button
                  onClick={() => {
                    setEditingBudget(null)
                    setBudgetFormOpen(true)
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Budget
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {monthBudgets.map((budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    spent={getBudgetSpent(budget)}
                    categories={categories}
                    currency={settings.currency}
                    onEdit={handleEditBudget}
                    onDelete={deleteBudget}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recurring" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-balance">Recurring Transactions</h2>
                <p className="text-muted-foreground">Automate regular income and expenses</p>
              </div>
              <Button
                onClick={() => {
                  setEditingRecurring(null)
                  setRecurringFormOpen(true)
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Recurring
              </Button>
            </div>

            <RecurringList
              recurring={recurring}
              categories={categories}
              onEdit={handleEditRecurring}
              onDelete={deleteRecurring}
              onToggleActive={handleToggleRecurring}
              currency={settings.currency}
            />
          </TabsContent>
        </Tabs>
      </main>

      <TransactionForm
        open={transactionFormOpen}
        onOpenChange={(open) => {
          setTransactionFormOpen(open)
          if (!open) setEditingTransaction(null)
        }}
        onSubmit={handleTransactionSubmit}
        categories={categories}
        editingTransaction={editingTransaction}
      />

      <BudgetForm
        open={budgetFormOpen}
        onOpenChange={(open) => {
          setBudgetFormOpen(open)
          if (!open) setEditingBudget(null)
        }}
        onSubmit={handleBudgetSubmit}
        categories={categories}
        editingBudget={editingBudget}
      />

      <RecurringForm
        open={recurringFormOpen}
        onOpenChange={(open) => {
          setRecurringFormOpen(open)
          if (!open) setEditingRecurring(null)
        }}
        onSubmit={handleRecurringSubmit}
        categories={categories}
        editingRecurring={editingRecurring}
      />
    </div>
  )
}
