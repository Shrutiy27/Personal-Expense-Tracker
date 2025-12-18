"use client"

import { Pencil, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Budget, Category } from "@/lib/types"
import { formatCurrency, getCategoryName, getCategoryColor, checkBudgetAlert } from "@/lib/utils-expense"

interface BudgetCardProps {
  budget: Budget
  spent: number
  categories: Category[]
  currency: string
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => void
}

export function BudgetCard({ budget, spent, categories, currency, onEdit, onDelete }: BudgetCardProps) {
  const categoryName = getCategoryName(budget.category, categories)
  const categoryColor = getCategoryColor(budget.category, categories)
  const { isOverBudget, isNearLimit, percentage } = checkBudgetAlert(budget, spent)

  const remaining = budget.amount - spent
  const progressPercentage = Math.min(percentage, 100)

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: categoryColor }} />
              <h3 className="font-semibold">{categoryName}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(budget.month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(budget)}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit budget</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(budget.id)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete budget</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <span className="font-medium">
              {formatCurrency(spent, currency)} / {formatCurrency(budget.amount, currency)}
            </span>
          </div>

          <Progress
            value={progressPercentage}
            className="h-2"
            indicatorClassName={isOverBudget ? "bg-destructive" : isNearLimit ? "bg-yellow-500" : "bg-primary"}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOverBudget && (
                <Badge variant="destructive" className="gap-1 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  Over Budget
                </Badge>
              )}
              {isNearLimit && !isOverBudget && (
                <Badge variant="outline" className="gap-1 text-xs border-yellow-500 text-yellow-600">
                  <AlertTriangle className="h-3 w-3" />
                  Near Limit
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}% used</span>
            </div>

            <span
              className={`text-sm font-medium ${remaining >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {remaining >= 0 ? "+" : ""}
              {formatCurrency(remaining, currency)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
