"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"

// ── Types ──────────────────────────────────────────
type WorkItemStatus = "todo" | "in_progress" | "done"

type WorkItem = {
  id: string
  title: string
  status: WorkItemStatus
  notes: string | null
  created_at: string
  updated_at: string
}

const statusConfig: Record<WorkItemStatus, { label: string; color: string }> = {
  todo: { label: "To Do", color: "bg-gray-100 text-gray-800" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  done: { label: "Done", color: "bg-green-100 text-green-800" },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
}

// ── Main Panel ─────────────────────────────────────
export function TasksTab() {
  const [items, setItems] = useState<WorkItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editStatus, setEditStatus] = useState<WorkItemStatus>("todo")

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // ── Load ──────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setError(null)
      const supabase = getSupabaseBrowserClient()
      const { data, error: e } = await supabase
        .from("work_items")
        .select("id, title, status, notes, created_at, updated_at")
        .order("updated_at", { ascending: false })
      if (e) throw new Error(e.message)
      setItems((data || []) as WorkItem[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Create ────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setIsCreating(true)
    try {
      const supabase = getSupabaseBrowserClient()
      // @ts-expect-error - No generated types
      const { data, error: insertErr } = await supabase
        .from("work_items")
        .insert({ title: newTitle.trim(), notes: newNotes.trim() || null, status: "todo" })
        .select("id, title, status, notes, created_at, updated_at")
        .single()
      if (insertErr) throw new Error(insertErr.message)
      if (data) setItems([data, ...items])
      setNewTitle("")
      setNewNotes("")
      setShowCreate(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create")
    } finally {
      setIsCreating(false)
    }
  }

  // ── Edit ──────────────────────────────────────
  const startEdit = (item: WorkItem) => {
    setEditingId(item.id)
    setEditTitle(item.title)
    setEditNotes(item.notes || "")
    setEditStatus(item.status)
  }

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return
    try {
      const supabase = getSupabaseBrowserClient()
      // @ts-expect-error - No generated types
      const { data, error: e } = await supabase
        .from("work_items")
        .update({
          title: editTitle.trim(),
          notes: editNotes.trim() || null,
          status: editStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)
        .select("id, title, status, notes, created_at, updated_at")
        .single()
      if (e) throw new Error(e.message)
      if (data) setItems(items.map((i) => (i.id === editingId ? data : i)))
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update")
    }
  }

  // ── Quick status ──────────────────────────────
  const quickStatus = async (id: string, status: WorkItemStatus) => {
    try {
      const supabase = getSupabaseBrowserClient()
      // @ts-expect-error - No generated types
      const { data, error: e } = await supabase
        .from("work_items")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id, title, status, notes, created_at, updated_at")
        .single()
      if (e) throw new Error(e.message)
      if (data) setItems(items.map((i) => (i.id === id ? data : i)))
    } catch {}
  }

  // ── Delete ────────────────────────────────────
  const deleteItem = async () => {
    if (!deleteConfirm) return
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.from("work_items").delete().eq("id", deleteConfirm)
      setItems(items.filter((i) => i.id !== deleteConfirm))
    } catch {}
    setDeleteConfirm(null)
  }

  // ── Counts ────────────────────────────────────
  const counts = { todo: 0, in_progress: 0, done: 0 }
  items.forEach((i) => { counts[i.status]++ })

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {(["todo", "in_progress", "done"] as const).map((s) => (
          <div key={s} className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground mb-1">{statusConfig[s].label}</p>
            <p className="text-2xl font-semibold">{counts[s]}</p>
          </div>
        ))}
      </div>

      {/* Create button / form */}
      {showCreate ? (
        <form onSubmit={handleCreate} className="rounded-lg border p-4 space-y-3 bg-muted/20">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Task title..."
            required
            disabled={isCreating}
          />
          <Textarea
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Notes (optional)..."
            rows={2}
            disabled={isCreating}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isCreating || !newTitle.trim()}>
              {isCreating ? "Creating..." : "Create Task"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowCreate(true)} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Task
        </Button>
      )}

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30">
          <p className="text-sm text-destructive">{error}</p>
          <button onClick={() => setError(null)} className="text-xs underline text-destructive/80 mt-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Title</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[120px]">Updated</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No tasks yet. Create your first one above.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) =>
                editingId === item.id ? (
                  <TableRow key={item.id} className="bg-muted/10">
                    <TableCell>
                      <div className="space-y-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-8"
                        />
                        <Input
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Notes..."
                          className="h-8"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={editStatus} onValueChange={(v) => setEditStatus(v as WorkItemStatus)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell />
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={saveEdit}>
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={item.id} className="hover:bg-muted/10">
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.status}
                        onValueChange={(v) => quickStatus(item.id, v as WorkItemStatus)}
                      >
                        <SelectTrigger className="h-7 text-xs w-[110px]">
                          <Badge variant="secondary" className={`text-xs ${statusConfig[item.status].color}`}>
                            {statusConfig[item.status].label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{formatDate(item.updated_at)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteConfirm(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteItem}
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
