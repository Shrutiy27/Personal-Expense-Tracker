"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Download, Upload, FileJson, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { storage } from "@/lib/storage"
import { exportToCSV, exportToJSON, parseCSV, generateId } from "@/lib/utils-expense"
import type { Transaction, Category } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ImportExportDialogProps {
  transactions: Transaction[]
  categories: Category[]
  onImport: () => void
}

export function ImportExportDialog({ transactions, categories, onImport }: ImportExportDialogProps) {
  const [mode, setMode] = useState<"export" | "import">("export")
  const [format, setFormat] = useState<"csv" | "json">("csv")
  const [open, setOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleExport = () => {
    try {
      let content: string
      let filename: string
      let mimeType: string

      if (format === "csv") {
        content = exportToCSV(transactions, categories)
        filename = `expenses_${new Date().toISOString().split("T")[0]}.csv`
        mimeType = "text/csv"
      } else {
        const data = storage.exportData()
        content = exportToJSON(data)
        filename = `expenses_backup_${new Date().toISOString().split("T")[0]}.json`
        mimeType = "application/json"
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: `Your data has been exported to ${filename}`,
      })

      setOpen(false)
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      })
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()

      if (format === "csv") {
        const parsed = parseCSV(text)
        let importedCount = 0

        parsed.forEach((item) => {
          if (item.amount && item.type && item.date) {
            // Find category by name
            const category = categories.find(
              (c) => c.name.toLowerCase() === item.categoryName?.toLowerCase() && c.type === item.type,
            )

            if (category) {
              const transaction: Transaction = {
                id: generateId(),
                amount: item.amount,
                type: item.type,
                category: category.id,
                description: item.description || "",
                date: item.date,
                isRecurring: false,
              }
              storage.addTransaction(transaction)
              importedCount++
            }
          }
        })

        toast({
          title: "Import successful",
          description: `Imported ${importedCount} transactions`,
        })
      } else {
        // JSON import
        const data = JSON.parse(text)
        storage.importData(data)

        toast({
          title: "Import successful",
          description: "All data has been imported successfully",
        })
      }

      onImport()
      setOpen(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "There was an error importing your data. Please check the file format.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Import/Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import/Export Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Action</Label>
            <RadioGroup value={mode} onValueChange={(value) => setMode(value as "export" | "import")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="export" id="export" />
                <Label htmlFor="export" className="cursor-pointer">
                  Export my data
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="import" id="import" />
                <Label htmlFor="import" className="cursor-pointer">
                  Import data
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as "csv" | "json")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  CSV (Transactions only)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                  <FileJson className="h-4 w-4" />
                  JSON (Full backup)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {mode === "import" && (
            <Alert>
              <AlertDescription className="text-sm">
                Importing will add to your existing data. CSV imports only transactions, while JSON imports everything
                (transactions, budgets, categories, settings).
              </AlertDescription>
            </Alert>
          )}

          {mode === "export" ? (
            <Button onClick={handleExport} className="w-full gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={format === "csv" ? ".csv" : ".json"}
                onChange={handleImport}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} className="w-full gap-2">
                <Upload className="h-4 w-4" />
                Select File to Import
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
