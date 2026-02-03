"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// Tipos
type ConsultationStatus = "new" | "reviewing" | "contacted" | "scheduled" | "completed" | "archived"

type ConsultationRequest = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string | null
  nationality: string
  current_location: string
  case_type: string
  urgency: string
  case_description: string
  previous_attorney: string | null
  court_date: string | null
  preferred_contact_method: string
  preferred_consultation_time: string | null
  referral_source: string | null
  files: { name: string; size: number; type: string }[]
  language: string
  status: ConsultationStatus
  notes: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

const statusLabels: Record<ConsultationStatus, string> = {
  new: "Nuevo",
  reviewing: "En revisión",
  contacted: "Contactado",
  scheduled: "Cita programada",
  completed: "Completado",
  archived: "Archivado",
}

const statusColors: Record<ConsultationStatus, string> = {
  new: "bg-yellow-100 text-yellow-800",
  reviewing: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  scheduled: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
}

const urgencyColors: Record<string, string> = {
  immediate: "bg-red-100 text-red-800",
  urgent: "bg-orange-100 text-orange-800",
  normal: "bg-blue-100 text-blue-800",
  planning: "bg-gray-100 text-gray-800",
}

const urgencyLabels: Record<string, string> = {
  immediate: "Inmediato (24h)",
  urgent: "Urgente (1 sem)",
  normal: "Normal (2 sem)",
  planning: "Planificación",
}

const caseTypeLabels: Record<string, string> = {
  "immigration-visa": "Visa de Inmigración",
  "immigration-greencard": "Green Card",
  "immigration-citizenship": "Ciudadanía",
  "immigration-deportation": "Defensa de Deportación",
  "immigration-asylum": "Asilo",
  "criminal-defense": "Defensa Criminal",
  "civil-rights": "Derechos Civiles",
  "family-law": "Ley Familiar",
  "business-immigration": "Inmigración de Negocios",
  "other": "Otro",
}

export function ConsultationRequestsPanel() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Cargar solicitudes
  const loadRequests = useCallback(async () => {
    try {
      setError(null)
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - No hay tipos generados
      const { data, error: queryError } = await supabase
        .from("consultation_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (queryError) {
        console.error("Query error:", queryError)
        setError("No se pudieron cargar las solicitudes.")
        return
      }

      setRequests(data || [])
    } catch (err) {
      console.error("Load error:", err)
      setError("Error de conexión.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  // Actualizar estado
  const updateStatus = async (id: string, newStatus: ConsultationStatus) => {
    try {
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - No hay tipos generados
      const { error } = await supabase
        .from("consultation_requests")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) {
        console.error("Update error:", error)
        alert("Error al actualizar estado")
        return
      }

      // Actualizar localmente
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r))
      )
    } catch (err) {
      console.error("Update error:", err)
    }
  }

  // Eliminar solicitud
  const deleteRequest = async (id: string) => {
    if (!confirm("¿Eliminar esta solicitud permanentemente?")) return

    try {
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - No hay tipos generados
      const { error } = await supabase.from("consultation_requests").delete().eq("id", id)

      if (error) {
        console.error("Delete error:", error)
        alert("Error al eliminar")
        return
      }

      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg p-6 bg-white">
        <h2 className="text-lg font-semibold mb-4">📋 Solicitudes de Consulta</h2>
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border rounded-lg p-6 bg-white">
        <h2 className="text-lg font-semibold mb-4">📋 Solicitudes de Consulta</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadRequests} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">📋 Solicitudes de Consulta ({requests.length})</h2>
        <button onClick={loadRequests} className="text-sm text-blue-600 hover:text-blue-800">
          🔄 Actualizar
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay solicitudes todavía</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const isExpanded = expandedId === request.id

            return (
              <div key={request.id} className="border rounded-lg overflow-hidden">
                {/* Header - clickeable */}
                <div
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : request.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {request.first_name} {request.last_name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${urgencyColors[request.urgency] || "bg-gray-100"}`}>
                          {urgencyLabels[request.urgency] || request.urgency}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {request.email} • {request.phone}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">{caseTypeLabels[request.case_type] || request.case_type}</span>
                        {" • "}
                        {request.nationality} • {request.current_location}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(request.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Contenido expandido */}
                {isExpanded && (
                  <div className="p-4 border-t bg-white">
                    {/* Información personal */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">👤 Información Personal</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Nacionalidad:</span> {request.nationality}
                        </div>
                        <div>
                          <span className="text-gray-500">Ubicación:</span> {request.current_location}
                        </div>
                        {request.date_of_birth && (
                          <div>
                            <span className="text-gray-500">Fecha de nacimiento:</span> {request.date_of_birth}
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Idioma:</span> {request.language === "es" ? "Español" : "English"}
                        </div>
                      </div>
                    </div>

                    {/* Descripción del caso */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Descripción del Caso</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                        {request.case_description}
                      </p>
                    </div>

                    {/* Información adicional */}
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      {request.previous_attorney && (
                        <div>
                          <span className="text-sm text-gray-500">Abogado previo:</span>
                          <p className="text-sm">{request.previous_attorney}</p>
                        </div>
                      )}
                      {request.court_date && (
                        <div>
                          <span className="text-sm text-gray-500">Fecha de corte:</span>
                          <p className="text-sm font-medium text-red-600">{request.court_date}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-500">Contacto preferido:</span>
                        <p className="text-sm">{request.preferred_contact_method}</p>
                      </div>
                      {request.preferred_consultation_time && (
                        <div>
                          <span className="text-sm text-gray-500">Horario preferido:</span>
                          <p className="text-sm">{request.preferred_consultation_time}</p>
                        </div>
                      )}
                      {request.referral_source && (
                        <div>
                          <span className="text-sm text-gray-500">Referido por:</span>
                          <p className="text-sm">{request.referral_source}</p>
                        </div>
                      )}
                    </div>

                    {/* Archivos */}
                    {request.files && request.files.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">📎 Archivos ({request.files.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {request.files.map((file, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t">
                      <span className="text-sm text-gray-500 mr-2">Cambiar estado:</span>
                      {(Object.keys(statusLabels) as ConsultationStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(request.id, status)}
                          disabled={request.status === status}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            request.status === status
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : `${statusColors[status]} hover:opacity-80`
                          }`}
                        >
                          {statusLabels[status]}
                        </button>
                      ))}
                      <button
                        onClick={() => deleteRequest(request.id)}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 ml-auto"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
