"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// Tipos
type ConsultStatus = "nuevo" | "en_revision" | "contactado" | "cerrado"

type ConsultRequest = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  mensaje: string
  status: ConsultStatus
  created_at: string
  updated_at: string
}

const statusLabels: Record<ConsultStatus, string> = {
  nuevo: "Nuevo",
  en_revision: "En revisión",
  contactado: "Contactado",
  cerrado: "Cerrado",
}

const statusColors: Record<ConsultStatus, string> = {
  nuevo: "bg-yellow-100 text-yellow-800",
  en_revision: "bg-blue-100 text-blue-800",
  contactado: "bg-green-100 text-green-800",
  cerrado: "bg-gray-100 text-gray-800",
}

export function ConsultRequestsPanel() {
  const [requests, setRequests] = useState<ConsultRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Cargar solicitudes
  const loadRequests = useCallback(async () => {
    try {
      setError(null)
      const supabase = getSupabaseBrowserClient()

      const { data, error: queryError } = await supabase
        .from("consult_requests")
        .select("id, nombre, email, telefono, mensaje, status, created_at, updated_at")
        .order("created_at", { ascending: false })

      if (queryError) {
        console.error("Query error:", queryError)
        setError("No se pudieron cargar las solicitudes. " + queryError.message)
        return
      }

      setRequests((data || []) as ConsultRequest[])
    } catch (err) {
      console.error("Load error:", err)
      setError("Error de conexión al cargar solicitudes.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  // Cambiar estado
  const updateStatus = async (id: string, newStatus: ConsultStatus) => {
    try {
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - No hay tipos generados de Supabase
      const { error: updateError } = await supabase
        .from("consult_requests")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (updateError) {
        setError("Error al actualizar: " + updateError.message)
        return
      }

      // Actualizar localmente
      setRequests(requests.map(r => 
        r.id === id ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r
      ))
    } catch (err) {
      console.error("Update error:", err)
      setError("Error de conexión al actualizar.")
    }
  }

  // Eliminar solicitud
  const deleteRequest = async (id: string) => {
    if (!confirm("¿Eliminar esta solicitud?")) return

    try {
      const supabase = getSupabaseBrowserClient()

      const { error: deleteError } = await supabase
        .from("consult_requests")
        .delete()
        .eq("id", id)

      if (deleteError) {
        setError("Error al eliminar: " + deleteError.message)
        return
      }

      setRequests(requests.filter(r => r.id !== id))
    } catch (err) {
      console.error("Delete error:", err)
      setError("Error de conexión al eliminar.")
    }
  }

  // Contar por estado
  const newCount = requests.filter(r => r.status === "nuevo").length

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Solicitudes de Consulta</h2>
          <p className="text-sm text-muted-foreground">
            {requests.length} total {newCount > 0 && <span className="text-yellow-600">• {newCount} nuevas</span>}
          </p>
        </div>
        <button
          onClick={() => {
            setIsLoading(true)
            loadRequests()
          }}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Actualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="m-4 p-3 rounded-md bg-destructive/10 border border-destructive/30">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando solicitudes...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No hay solicitudes de consulta aún.
        </div>
      ) : (
        <div className="divide-y">
          {requests.map((req) => (
            <div key={req.id} className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{req.nombre}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>
                      {statusLabels[req.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{req.email}</p>
                  {req.telefono && (
                    <p className="text-sm text-muted-foreground">{req.telefono}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <select
                    value={req.status}
                    onChange={(e) => updateStatus(req.id, e.target.value as ConsultStatus)}
                    className="h-8 text-xs rounded-md border border-input bg-background px-2"
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="en_revision">En revisión</option>
                    <option value="contactado">Contactado</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                  <button
                    onClick={() => deleteRequest(req.id)}
                    className="p-1.5 text-xs border rounded hover:bg-destructive/10 text-destructive"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Mensaje expandido */}
              {expandedId === req.id && (
                <div className="mt-3 p-3 rounded-md bg-muted/50">
                  <p className="text-sm font-medium mb-1">Mensaje:</p>
                  <p className="text-sm whitespace-pre-wrap">{req.mensaje}</p>
                  
                  {/* Quick actions */}
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`mailto:${req.email}`}
                      className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Enviar Email
                    </a>
                    {req.telefono && (
                      <a
                        href={`tel:${req.telefono}`}
                        className="text-xs px-3 py-1.5 border rounded-md hover:bg-secondary"
                      >
                        Llamar
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
