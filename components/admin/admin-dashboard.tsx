"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { ConsultRequestsPanel } from "./consult-requests-panel"
import { ChatPanel } from "./chat-panel"

// Tipos
type WorkItemStatus = "todo" | "in_progress" | "done"

type WorkItem = {
  id: string
  title: string
  status: WorkItemStatus
  notes: string | null
  created_at: string
  updated_at: string
}

interface AdminDashboardProps {
  user: User
  onSignOut: () => void
}

const statusLabels: Record<WorkItemStatus, string> = {
  todo: "Pendiente",
  in_progress: "En progreso",
  done: "Completado",
}

const statusColors: Record<WorkItemStatus, string> = {
  todo: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
}

export function AdminDashboard({ user, onSignOut }: AdminDashboardProps) {
  const [items, setItems] = useState<WorkItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [newTitle, setNewTitle] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editStatus, setEditStatus] = useState<WorkItemStatus>("todo")

  // Cargar items - todo en el cliente
  const loadItems = useCallback(async () => {
    try {
      setError(null)
      const supabase = getSupabaseBrowserClient()

      const { data, error: queryError } = await supabase
        .from("work_items")
        .select("id, title, status, notes, created_at, updated_at")
        .order("updated_at", { ascending: false })

      if (queryError) {
        console.error("Query error:", queryError)
        setError("No se pudieron cargar los items. " + queryError.message)
        return
      }

      setItems(data || [])
    } catch (err) {
      console.error("Load items error:", err)
      setError("Error de conexión al cargar datos.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  // Crear item
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setIsCreating(true)
    try {
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - No hay tipos generados de Supabase, pero funciona en runtime
      const { data, error: insertError } = await supabase
        .from("work_items")
        .insert({
          title: newTitle.trim(),
          notes: newNotes.trim() || null,
          status: "todo",
        })
        .select("id, title, status, notes, created_at, updated_at")
        .single()

      if (insertError) {
        setError("Error al crear: " + insertError.message)
        return
      }

      if (data) {
        setItems([data, ...items])
        setNewTitle("")
        setNewNotes("")
      }
    } catch (err) {
      console.error("Create error:", err)
      setError("Error de conexión al crear.")
    } finally {
      setIsCreating(false)
    }
  }

  // Iniciar edición
  const startEdit = (item: WorkItem) => {
    setEditingId(item.id)
    setEditTitle(item.title)
    setEditNotes(item.notes || "")
    setEditStatus(item.status)
  }

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle("")
    setEditNotes("")
    setEditStatus("todo")
  }

  // Guardar edición
  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return

    try {
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - No hay tipos generados de Supabase, pero funciona en runtime
      const { data, error: updateError } = await supabase
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

      if (updateError) {
        setError("Error al actualizar: " + updateError.message)
        return
      }

      if (data) {
        setItems(items.map(i => i.id === editingId ? data : i))
        cancelEdit()
      }
    } catch (err) {
      console.error("Update error:", err)
      setError("Error de conexión al actualizar.")
    }
  }

  // Eliminar item
  const deleteItem = async (id: string) => {
    if (!confirm("¿Eliminar este item?")) return

    try {
      const supabase = getSupabaseBrowserClient()

      const { error: deleteError } = await supabase
        .from("work_items")
        .delete()
        .eq("id", id)

      if (deleteError) {
        setError("Error al eliminar: " + deleteError.message)
        return
      }

      setItems(items.filter(i => i.id !== id))
    } catch (err) {
      console.error("Delete error:", err)
      setError("Error de conexión al eliminar.")
    }
  }

  // Cambio rápido de status
  const quickStatusChange = async (id: string, newStatus: WorkItemStatus) => {
    try {
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - No hay tipos generados de Supabase, pero funciona en runtime
      const { data, error: updateError } = await supabase
        .from("work_items")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("id, title, status, notes, created_at, updated_at")
        .single()

      if (updateError) {
        setError("Error al cambiar status: " + updateError.message)
        return
      }

      if (data) {
        setItems(items.map(i => i.id === id ? data : i))
      }
    } catch (err) {
      console.error("Quick status error:", err)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={onSignOut}
            className="px-4 py-2 text-sm border rounded-md hover:bg-secondary transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs underline text-destructive/80"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Panel de Solicitudes de Consulta */}
        <div className="mb-8">
          <ConsultRequestsPanel />
        </div>

        {/* Panel de Chat de Soporte */}
        <div className="mb-8">
          <ChatPanel adminEmail={user.email || ""} />
        </div>

        {/* Crear nuevo item */}
        <div className="mb-8 p-6 rounded-lg border bg-card">
          <h2 className="text-lg font-semibold mb-4">Nuevo Item</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Descripción del trabajo..."
                required
                disabled={isCreating}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notas</label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notas adicionales..."
                rows={2}
                disabled={isCreating}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isCreating || !newTitle.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isCreating ? "Creando..." : "Crear Item"}
            </button>
          </form>
        </div>

        {/* Lista de items */}
        <div className="rounded-lg border bg-card">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Work Items ({items.length})</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay items. Crea el primero arriba.
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="p-4">
                  {editingId === item.id ? (
                    // Modo edición
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={2}
                        placeholder="Notas..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as WorkItemStatus)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="todo">Pendiente</option>
                        <option value="in_progress">En progreso</option>
                        <option value="done">Completado</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 border text-sm rounded-md hover:bg-secondary"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo vista
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{item.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>
                            {statusLabels[item.status]}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Actualizado: {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Quick status buttons */}
                        {item.status !== "done" && (
                          <button
                            onClick={() => quickStatusChange(item.id, item.status === "todo" ? "in_progress" : "done")}
                            className="p-1.5 text-xs border rounded hover:bg-secondary"
                            title={item.status === "todo" ? "Marcar en progreso" : "Marcar completado"}
                          >
                            {item.status === "todo" ? "▶" : "✓"}
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 text-xs border rounded hover:bg-secondary"
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 text-xs border rounded hover:bg-destructive/10 text-destructive"
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refresh button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLoading(true)
              loadItems()
            }}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Recargar datos
          </button>
        </div>
      </main>
    </div>
  )
}
