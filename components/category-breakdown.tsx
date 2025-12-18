"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { Transaction, Category } from "@/lib/types"
import { getMonthKey, getCategoryName, getCategoryColor } from "@/lib/utils-expense"

interface CategoryBreakdownProps {
  transactions: Transaction[]
  categories: Category[]
  selectedMonth: string
  currency: string
}

export function CategoryBreakdown({ transactions, categories, selectedMonth, currency }: CategoryBreakdownProps) {
  const monthTransactions = transactions.filter((t) => getMonthKey(t.date) === selectedMonth && t.type === "expense")

  const categoryTotals = new Map<string, number>()
  monthTransactions.forEach((t) => {
    categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount)
  })

  const data = Array.from(categoryTotals.entries())
    .map(([categoryId, amount]) => ({
      name: getCategoryName(categoryId, categories),
      value: amount,
      color: getCategoryColor(categoryId, categories),
    }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">No expense data for this month</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency,
                }).format(value)
              }
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          {data.slice(0, 5).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
              <span className="font-medium">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency,
                }).format(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
