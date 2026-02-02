"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  createWorkItemAction,
  deleteWorkItemAction,
  updateWorkItemAction,
  type WorkItemStatus,
} from "@/app/admin/actions"

export type WorkItem = {
  id: string
  title: string
  status: WorkItemStatus
  notes: string | null
  created_at: string
  updated_at: string
}

const statusMeta: Record<WorkItemStatus, { label: string; badgeVariant: "default" | "secondary" | "outline" }> = {
  todo: { label: "To do", badgeVariant: "secondary" },
  in_progress: { label: "In progress", badgeVariant: "default" },
  done: { label: "Done", badgeVariant: "outline" },
}

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

export function WorkItemsPanel({ initialItems }: { initialItems: WorkItem[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")

  const counts = useMemo(() => {
    const base = { todo: 0, in_progress: 0, done: 0 } as Record<WorkItemStatus, number>
    for (const item of initialItems) base[item.status] += 1
    return base
  }, [initialItems])

  function onCreate() {
    const t = title.trim()
    if (!t) return

    startTransition(async () => {
      try {
        await createWorkItemAction({ title: t, notes: notes.trim() ? notes.trim() : undefined })
        setTitle("")
        setNotes("")
        router.refresh()
        toast({ title: "Created", description: "Work item added." })
      } catch (e) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "Failed to create", variant: "destructive" })
      }
    })
  }

  function onUpdateStatus(id: string, status: WorkItemStatus) {
    startTransition(async () => {
      try {
        await updateWorkItemAction({ id, status })
        router.refresh()
      } catch (e) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "Failed to update", variant: "destructive" })
      }
    })
  }

  function onSaveEdit(item: WorkItem, next: { title: string; notes: string }) {
    startTransition(async () => {
      try {
        await updateWorkItemAction({
          id: item.id,
          title: next.title.trim() || item.title,
          notes: next.notes.trim() ? next.notes.trim() : null,
        })
        router.refresh()
        toast({ title: "Saved", description: "Changes updated." })
      } catch (e) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "Failed to save", variant: "destructive" })
      }
    })
  }

  function onDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteWorkItemAction(id)
        router.refresh()
        toast({ title: "Deleted", description: "Work item removed." })
      } catch (e) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "Failed to delete", variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">To do</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.todo}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">In progress</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.in_progress}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Done</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.done}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add work item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g. USCIS RFE response for client" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything important to remember..." />
          </div>
          <Button onClick={onCreate} disabled={isPending || !title.trim()}>
            {isPending ? "Saving..." : "Add"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No items yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  initialItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Badge variant={statusMeta[item.status].badgeVariant}>{statusMeta[item.status].label}</Badge>
                          <Select value={item.status} onValueChange={(v) => onUpdateStatus(item.id, v as WorkItemStatus)}>
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">To do</SelectItem>
                              <SelectItem value="in_progress">In progress</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(item.updated_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <EditDialog item={item} onSave={onSaveEdit} disabled={isPending} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={isPending}>
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete item?</AlertDialogTitle>
                                <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(item.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EditDialog({
  item,
  onSave,
  disabled,
}: {
  item: WorkItem
  onSave: (item: WorkItem, next: { title: string; notes: string }) => void
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [notes, setNotes] = useState(item.notes ?? "")

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (v) {
          setTitle(item.title)
          setNotes(item.notes ?? "")
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit work item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`edit-title-${item.id}`}>Title</Label>
            <Input id={`edit-title-${item.id}`} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-notes-${item.id}`}>Notes</Label>
            <Textarea id={`edit-notes-${item.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onSave(item, { title, notes })
              setOpen(false)
            }}
            disabled={disabled || !title.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
