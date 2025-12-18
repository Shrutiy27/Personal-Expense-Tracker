"use client"

import { useState } from "react"
import { Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Transaction, Category } from "@/lib/types"
import { formatCurrency, formatDate, getCategoryName, getCategoryColor } from "@/lib/utils-expense"

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  currency: string
  dateFormat: string
}

export function TransactionList({
  transactions,
  categories,
  onEdit,
  onDelete,
  currency,
  dateFormat,
}: TransactionListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (transactions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No transactions yet. Add your first transaction to get started.</p>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {sortedTransactions.map((transaction) => {
          const categoryColor = getCategoryColor(transaction.category, categories)
          const categoryName = getCategoryName(transaction.category, categories)

          return (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                    style={{ backgroundColor: `${categoryColor}20` }}
                  >
                    {transaction.type === "income" ? (
                      <TrendingUp className="h-5 w-5" style={{ color: categoryColor }} />
                    ) : (
                      <TrendingDown className="h-5 w-5" style={{ color: categoryColor }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{transaction.description}</p>
                      {transaction.isRecurring && (
                        <Badge variant="outline" className="text-xs">
                          Recurring
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span style={{ color: categoryColor }}>{categoryName}</span>
                      <span>•</span>
                      <span>{formatDate(transaction.date, dateFormat)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`text-lg font-semibold ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount, currency)}
                  </span>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit transaction</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(transaction.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete transaction</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDelete(deleteId)
                setDeleteId(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
