"use client"

import { useState } from "react"
import { Pencil, Trash2, PlayCircle, PauseCircle, TrendingUp, TrendingDown, Repeat } from "lucide-react"
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
import type { RecurringTransaction, Category } from "@/lib/types"
import { formatCurrency, getCategoryName, getCategoryColor } from "@/lib/utils-expense"

interface RecurringListProps {
  recurring: RecurringTransaction[]
  categories: Category[]
  onEdit: (recurring: RecurringTransaction) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
  currency: string
}

export function RecurringList({
  recurring,
  categories,
  onEdit,
  onDelete,
  onToggleActive,
  currency,
}: RecurringListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (recurring.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No recurring transactions yet. Create one to automate your finances.</p>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {recurring.map((r) => {
          const categoryColor = getCategoryColor(r.category, categories)
          const categoryName = getCategoryName(r.category, categories)

          return (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                    style={{ backgroundColor: `${categoryColor}20` }}
                  >
                    <Repeat className="h-5 w-5" style={{ color: categoryColor }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{r.description}</p>
                      <Badge variant={r.isActive ? "default" : "secondary"} className="text-xs">
                        {r.isActive ? "Active" : "Paused"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {r.frequency}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span style={{ color: categoryColor }}>{categoryName}</span>
                      <span>•</span>
                      <span>
                        {r.type === "income" ? (
                          <TrendingUp className="inline h-3 w-3" />
                        ) : (
                          <TrendingDown className="inline h-3 w-3" />
                        )}{" "}
                        {r.type}
                      </span>
                      {r.endDate && (
                        <>
                          <span>•</span>
                          <span>Until {new Date(r.endDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`text-lg font-semibold ${r.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {r.type === "income" ? "+" : "-"}
                    {formatCurrency(r.amount, currency)}
                  </span>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleActive(r.id, !r.isActive)}
                      title={r.isActive ? "Pause" : "Resume"}
                    >
                      {r.isActive ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                      <span className="sr-only">{r.isActive ? "Pause" : "Resume"}</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(r)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit recurring transaction</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete recurring transaction</span>
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
            <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recurring transaction? This will not affect transactions that have
              already been created.
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
