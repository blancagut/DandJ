"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AdminDataTable, type Column, type StatusOption } from "../admin-data-table"
import { Badge } from "@/components/ui/badge"

// ── Types ──────────────────────────────────────────
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
  case_sub_type: string | null
  urgency: string
  case_description: string
  previous_attorney: string | null
  court_date: string | null
  preferred_contact_method: string
  preferred_consultation_time: string | null
  referral_source: string | null
  document_types: string[] | null
  files: { name: string; size: number; type: string }[] | null
  language: string
  status: ConsultationStatus
  notes: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

// ── Labels ─────────────────────────────────────────
const statusOptions: StatusOption[] = [
  { value: "new", label: "New", color: "bg-yellow-100 text-yellow-800" },
  { value: "reviewing", label: "Reviewing", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Contacted", color: "bg-purple-100 text-purple-800" },
  { value: "scheduled", label: "Scheduled", color: "bg-indigo-100 text-indigo-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-800" },
]

const statusColorMap: Record<string, string> = Object.fromEntries(
  statusOptions.map((s) => [s.value, s.color || ""])
)

const urgencyLabels: Record<string, { label: string; color: string }> = {
  immediate: { label: "Immediate (24h)", color: "bg-red-100 text-red-800" },
  urgent: { label: "Urgent (1 wk)", color: "bg-orange-100 text-orange-800" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-800" },
  planning: { label: "Planning", color: "bg-gray-100 text-gray-800" },
}

const caseTypeLabels: Record<string, string> = {
  "immigration-visa": "Immigration Visa",
  "immigration-greencard": "Green Card",
  "immigration-citizenship": "Citizenship",
  "immigration-deportation": "Deportation Defense",
  "immigration-asylum": "Asylum",
  "criminal-defense": "Criminal Defense",
  "civil-rights": "Civil Rights",
  "family-law": "Family Law",
  "business-immigration": "Business Immigration",
  other: "Other",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

// ── Columns ────────────────────────────────────────
const columns: Column<ConsultationRequest>[] = [
  {
    key: "first_name",
    header: "Name",
    render: (r) => (
      <span className="font-medium">
        {r.first_name} {r.last_name}
      </span>
    ),
  },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  {
    key: "case_type",
    header: "Case Type",
    render: (r) => (
      <span className="text-xs">{caseTypeLabels[r.case_type] || r.case_type}</span>
    ),
  },
  {
    key: "urgency",
    header: "Urgency",
    render: (r) => {
      const u = urgencyLabels[r.urgency]
      return u ? (
        <Badge variant="secondary" className={`text-xs ${u.color}`}>
          {u.label}
        </Badge>
      ) : (
        <span className="text-xs">{r.urgency}</span>
      )
    },
  },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <Badge variant="secondary" className={`text-xs ${statusColorMap[r.status] || ""}`}>
        {statusOptions.find((s) => s.value === r.status)?.label || r.status}
      </Badge>
    ),
  },
  {
    key: "created_at",
    header: "Date",
    render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>,
  },
]

// ── Expanded Detail ────────────────────────────────
function ConsultationDetail({ r }: { r: ConsultationRequest }) {
  const [notes, setNotes] = useState(r.notes || "")
  const [saving, setSaving] = useState(false)

  async function saveNotes() {
    setSaving(true)
    try {
      const supabase = getSupabaseBrowserClient()
      // @ts-expect-error - No generated types
      await supabase
        .from("consultation_requests")
        .update({ notes, updated_at: new Date().toISOString() })
        .eq("id", r.id)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Personal info */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Personal Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Nationality:</span>{" "}
            <span className="font-medium">{r.nationality}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Location:</span>{" "}
            <span className="font-medium">{r.current_location}</span>
          </div>
          {r.date_of_birth && (
            <div>
              <span className="text-muted-foreground">DOB:</span>{" "}
              <span className="font-medium">{r.date_of_birth}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Language:</span>{" "}
            <span className="font-medium">{r.language === "es" ? "Spanish" : "English"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Contact:</span>{" "}
            <span className="font-medium">{r.preferred_contact_method}</span>
          </div>
          {r.preferred_consultation_time && (
            <div>
              <span className="text-muted-foreground">Preferred time:</span>{" "}
              <span className="font-medium">{r.preferred_consultation_time}</span>
            </div>
          )}
          {r.referral_source && (
            <div>
              <span className="text-muted-foreground">Referral:</span>{" "}
              <span className="font-medium">{r.referral_source}</span>
            </div>
          )}
        </div>
      </div>

      {/* Case description */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Case Description</h4>
        <p className="text-sm bg-muted/40 p-3 rounded-md whitespace-pre-wrap">{r.case_description}</p>
      </div>

      {/* Additional info row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        {r.previous_attorney && (
          <div>
            <span className="text-muted-foreground">Previous attorney:</span>{" "}
            <span className="font-medium">{r.previous_attorney}</span>
          </div>
        )}
        {r.court_date && (
          <div>
            <span className="text-muted-foreground">Court date:</span>{" "}
            <span className="font-medium text-red-600">{r.court_date}</span>
          </div>
        )}
        {r.assigned_to && (
          <div>
            <span className="text-muted-foreground">Assigned to:</span>{" "}
            <span className="font-medium">{r.assigned_to}</span>
          </div>
        )}
      </div>

      {/* Files */}
      {r.files && r.files.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Files ({r.files.length})</h4>
          <div className="flex flex-wrap gap-2">
            {r.files.map((f, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Admin Notes</h4>
        <div className="flex gap-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal notes about this case..."
            rows={2}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            onClick={saveNotes}
            disabled={saving || notes === (r.notes || "")}
            className="self-end px-3 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Panel ─────────────────────────────────────
export function ConsultationsTab() {
  const [data, setData] = useState<ConsultationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)
      const supabase = getSupabaseBrowserClient()
      // @ts-expect-error - No generated types
      const { data: rows, error: e } = await supabase
        .from("consultation_requests")
        .select("*")
        .order("created_at", { ascending: false })
      if (e) throw new Error(e.message)
      setData(rows || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Realtime ──────────────────────────────────
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel("admin_consultations")
      .on("postgres_changes", { event: "*", schema: "public", table: "consultation_requests" }, () => {
        load()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase
      .from("consultation_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
    if (e) { alert("Error: " + e.message); return }
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as ConsultationStatus } : r)))
  }

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase.from("consultation_requests").delete().eq("id", id)
    if (e) { alert("Error: " + e.message); return }
    setData((prev) => prev.filter((r) => r.id !== id))
  }

  const handleBulkDelete = async (ids: string[]) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase.from("consultation_requests").delete().in("id", ids)
    if (e) { alert("Error: " + e.message); return }
    setData((prev) => prev.filter((r) => !ids.includes(r.id)))
  }

  const handleBulkStatusChange = async (ids: string[], status: string) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase
      .from("consultation_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids)
    if (e) { alert("Error: " + e.message); return }
    setData((prev) =>
      prev.map((r) => (ids.includes(r.id) ? { ...r, status: status as ConsultationStatus } : r))
    )
  }

  return (
    <AdminDataTable<ConsultationRequest>
      data={data}
      columns={columns}
      isLoading={isLoading}
      error={error}
      title="Consultations"
      emptyMessage="No consultation requests yet."
      statusField="status"
      statusOptions={statusOptions}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onBulkStatusChange={handleBulkStatusChange}
      onRefresh={load}
      expandedContent={(r) => <ConsultationDetail r={r} />}
    />
  )
}
