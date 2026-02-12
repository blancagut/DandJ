"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Download,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// ── Types ──────────────────────────────────────────
export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  searchable?: boolean
  sortable?: boolean
  className?: string
}

export interface StatusOption {
  value: string
  label: string
  color?: string
}

export interface AdminDataTableProps<T extends { id: string }> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  error?: string | null
  statusField?: keyof T
  statusOptions?: StatusOption[]
  onStatusChange?: (id: string, status: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onBulkDelete?: (ids: string[]) => Promise<void>
  onBulkStatusChange?: (ids: string[], status: string) => Promise<void>
  onRefresh?: () => void
  expandedContent?: (row: T) => React.ReactNode
  title?: string
  emptyMessage?: string
  pageSize?: number
}

// ── CSV Export ─────────────────────────────────────
function exportToCSV<T extends { id: string }>(data: T[], columns: Column<T>[], title: string) {
  const headers = columns.map((c) => c.header)
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = (row as Record<string, unknown>)[col.key]
      if (val === null || val === undefined) return ""
      if (typeof val === "object") return JSON.stringify(val)
      return String(val).replace(/"/g, '""')
    })
  )

  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Component ──────────────────────────────────────
export function AdminDataTable<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  error = null,
  statusField,
  statusOptions = [],
  onStatusChange,
  onDelete,
  onBulkDelete,
  onBulkStatusChange,
  onRefresh,
  expandedContent,
  title = "Items",
  emptyMessage = "No items found.",
  pageSize: initialPageSize = 10,
}: AdminDataTableProps<T>) {
  // ── State ─────────────────────────────────────
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [pageSizeState, setPageSizeState] = useState(initialPageSize)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "single" | "bulk"; id?: string } | null>(null)
  const [bulkStatusValue, setBulkStatusValue] = useState<string>("")

  // ── Filtering ─────────────────────────────────
  const searchableKeys = useMemo(
    () => columns.filter((c) => c.searchable !== false).map((c) => c.key),
    [columns]
  )

  const filtered = useMemo(() => {
    let result = data

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((row) =>
        searchableKeys.some((key) => {
          const val = (row as Record<string, unknown>)[key]
          return val != null && String(val).toLowerCase().includes(q)
        })
      )
    }

    // Status filter
    if (statusFilter !== "all" && statusField) {
      result = result.filter((row) => (row as Record<string, unknown>)[statusField as string] === statusFilter)
    }

    // Sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey]
        const bVal = (b as Record<string, unknown>)[sortKey]
        const aStr = aVal != null ? String(aVal) : ""
        const bStr = bVal != null ? String(bVal) : ""
        const cmp = aStr.localeCompare(bStr)
        return sortDir === "asc" ? cmp : -cmp
      })
    }

    return result
  }, [data, search, statusFilter, statusField, sortKey, sortDir, searchableKeys])

  // ── Pagination ────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeState))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * pageSizeState, safePage * pageSizeState)

  // ── Selection ─────────────────────────────────
  const allPageSelected = paged.length > 0 && paged.every((r) => selectedIds.has(r.id))

  function toggleSelectAll() {
    if (allPageSelected) {
      const next = new Set(selectedIds)
      paged.forEach((r) => next.delete(r.id))
      setSelectedIds(next)
    } else {
      const next = new Set(selectedIds)
      paged.forEach((r) => next.add(r.id))
      setSelectedIds(next)
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  // ── Sort handler ──────────────────────────────
  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  // ── Delete handler ────────────────────────────
  async function handleDelete() {
    if (!deleteConfirm) return
    try {
      if (deleteConfirm.type === "single" && deleteConfirm.id && onDelete) {
        await onDelete(deleteConfirm.id)
      } else if (deleteConfirm.type === "bulk" && onBulkDelete) {
        await onBulkDelete(Array.from(selectedIds))
        setSelectedIds(new Set())
      }
    } finally {
      setDeleteConfirm(null)
    }
  }

  // ── Bulk status ───────────────────────────────
  async function handleBulkStatus() {
    if (!bulkStatusValue || selectedIds.size === 0 || !onBulkStatusChange) return
    await onBulkStatusChange(Array.from(selectedIds), bulkStatusValue)
    setSelectedIds(new Set())
    setBulkStatusValue("")
  }

  // ── Loading / Error states ────────────────────
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-destructive mb-3">{error}</p>
        {onRefresh && (
          <Button size="sm" variant="outline" onClick={onRefresh}>
            Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* ── Toolbar ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-8 h-9"
            />
          </div>

          {/* Status filter */}
          {statusOptions.length > 0 && (
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button size="sm" variant="ghost" onClick={onRefresh} className="h-9">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportToCSV(filtered, columns, title)}
            className="h-9"
          >
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
        </div>
      </div>

      {/* ── Bulk actions bar ─────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>

          {statusOptions.length > 0 && onBulkStatusChange && (
            <div className="flex items-center gap-1.5">
              <Select value={bulkStatusValue} onValueChange={setBulkStatusValue}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Set status..." />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleBulkStatus}
                disabled={!bulkStatusValue}
                className="h-8 text-xs"
              >
                Apply
              </Button>
            </div>
          )}

          {onBulkDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteConfirm({ type: "bulk" })}
              className="h-8 text-xs ml-auto"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete {selectedIds.size}
            </Button>
          )}
        </div>
      )}

      {/* ── Table ────────────────────────────────── */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {(onBulkDelete || onBulkStatusChange) && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allPageSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {expandedContent && <TableHead className="w-10" />}
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`${col.sortable !== false ? "cursor-pointer select-none" : ""} ${col.className || ""}`}
                  onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key &&
                      (sortDir === "asc" ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ))}
                  </div>
                </TableHead>
              ))}
              {(onStatusChange || onDelete) && (
                <TableHead className="text-right w-40">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (onBulkDelete || onBulkStatusChange ? 1 : 0) +
                    (expandedContent ? 1 : 0) +
                    (onStatusChange || onDelete ? 1 : 0)
                  }
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row) => {
                const isExpanded = expandedId === row.id
                return (
                  <TableRowGroup key={row.id}>
                    <TableRow
                      className={`transition-colors ${isExpanded ? "bg-muted/20" : "hover:bg-muted/10"}`}
                    >
                      {(onBulkDelete || onBulkStatusChange) && (
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(row.id)}
                            onCheckedChange={() => toggleSelect(row.id)}
                            aria-label={`Select row ${row.id}`}
                          />
                        </TableCell>
                      )}
                      {expandedContent && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setExpandedId(isExpanded ? null : row.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      )}
                      {columns.map((col) => (
                        <TableCell key={col.key} className={col.className}>
                          {col.render
                            ? col.render(row)
                            : String((row as Record<string, unknown>)[col.key] ?? "")}
                        </TableCell>
                      ))}
                      {(onStatusChange || onDelete) && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onStatusChange && statusOptions.length > 0 && statusField && (
                              <Select
                                value={String((row as Record<string, unknown>)[statusField as string] ?? "")}
                                onValueChange={(v) => onStatusChange(row.id, v)}
                              >
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {onDelete && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteConfirm({ type: "single", id: row.id })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                    {/* Expanded content */}
                    {isExpanded && expandedContent && (
                      <TableRow className="bg-muted/10 hover:bg-muted/10">
                        <TableCell
                          colSpan={
                            columns.length +
                            (onBulkDelete || onBulkStatusChange ? 1 : 0) +
                            (expandedContent ? 1 : 0) +
                            (onStatusChange || onDelete ? 1 : 0)
                          }
                          className="p-0"
                        >
                          <div className="px-6 py-4 border-t">{expandedContent(row)}</div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableRowGroup>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ───────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          {filtered.length !== data.length && ` (of ${data.length} total)`}
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSizeState)}
            onValueChange={(v) => {
              setPageSizeState(Number(v))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[70px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage(1)}
              disabled={safePage <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage(totalPages)}
              disabled={safePage >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Delete confirmation dialog ───────────── */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === "bulk"
                ? `Are you sure you want to delete ${selectedIds.size} items? This action cannot be undone.`
                : "Are you sure you want to delete this item? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Helper: Fragment-like wrapper for grouped table rows (expanded + main)
function TableRowGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
