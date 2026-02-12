"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AdminDataTable, type Column, type StatusOption } from "../admin-data-table"
import { Badge } from "@/components/ui/badge"

// ── Types ──────────────────────────────────────────
type ScreeningStatus = "new" | "reviewing" | "contacted" | "completed" | "archived"

type ScreeningRow = {
  id: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  data: Record<string, unknown>
  status: ScreeningStatus
  notes: string | null
  created_at: string
  updated_at: string
}

// ── Config ─────────────────────────────────────────
const statusOptions: StatusOption[] = [
  { value: "new", label: "New", color: "bg-yellow-100 text-yellow-800" },
  { value: "reviewing", label: "Reviewing", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Contacted", color: "bg-green-100 text-green-800" },
  { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-800" },
]

const statusColorMap: Record<string, string> = Object.fromEntries(
  statusOptions.map((s) => [s.value, s.color || ""])
)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
}

// ── Helpers to extract info from JSONB data ────────
function getPetitionSummary(data: Record<string, unknown>) {
  const ps = data.petitionScreening as Record<string, unknown> | undefined
  if (!ps) return { category: "—", priority: "—", waiverNeeded: false }
  return {
    category: String(ps.relationshipCategory || "—"),
    priority: String(ps.casePriority || "—"),
    waiverNeeded: Boolean(ps.waiverFlag),
  }
}

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  moderate: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
}

// ── Columns ────────────────────────────────────────
const columns: Column<ScreeningRow>[] = [
  {
    key: "contact_name",
    header: "Name",
    render: (r) => <span className="font-medium">{r.contact_name || "—"}</span>,
  },
  {
    key: "contact_email",
    header: "Email",
    render: (r) => <span>{r.contact_email || "—"}</span>,
  },
  {
    key: "contact_phone",
    header: "Phone",
    render: (r) => <span>{r.contact_phone || "—"}</span>,
  },
  {
    key: "data",
    header: "Category",
    sortable: false,
    searchable: false,
    render: (r) => {
      const s = getPetitionSummary(r.data)
      return <span className="text-xs font-mono">{s.category}</span>
    },
  },
  {
    key: "priority",
    header: "Priority",
    sortable: false,
    searchable: false,
    render: (r) => {
      const s = getPetitionSummary(r.data)
      return (
        <Badge variant="secondary" className={`text-xs ${priorityColors[s.priority] || ""}`}>
          {s.priority}
        </Badge>
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
function PetitionDetail({ r }: { r: ScreeningRow }) {
  const [notes, setNotes] = useState(r.notes || "")
  const [saving, setSaving] = useState(false)

  async function saveNotes() {
    setSaving(true)
    try {
      const supabase = getSupabaseBrowserClient()
      // @ts-expect-error - No generated types
      await supabase
        .from("petition_screenings")
        .update({ notes, updated_at: new Date().toISOString() })
        .eq("id", r.id)
    } finally {
      setSaving(false)
    }
  }

  const ps = r.data.petitionScreening as Record<string, unknown> | undefined
  const bi = ps?.beneficiaryInfo as Record<string, unknown> | undefined

  return (
    <div className="space-y-4">
      {/* Contact */}
      {(r.contact_name || r.contact_email || r.contact_phone) && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-800 font-semibold text-xs uppercase tracking-wide">Contact</span>
          <div className="mt-1 flex flex-wrap gap-4 text-sm">
            {r.contact_name && <span>{r.contact_name}</span>}
            {r.contact_email && <a href={`mailto:${r.contact_email}`} className="text-blue-600 underline">{r.contact_email}</a>}
            {r.contact_phone && <a href={`tel:${r.contact_phone}`} className="text-blue-600 underline">{r.contact_phone}</a>}
          </div>
        </div>
      )}

      {/* Screening details */}
      {ps && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {bi && (
            <>
              <div>
                <span className="text-muted-foreground">Country:</span>{" "}
                <span className="font-medium">{String(bi.countryOfBirth || "—")}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Age:</span>{" "}
                <span className="font-medium">{String(bi.age || "—")}</span>
              </div>
            </>
          )}
          <div>
            <span className="text-muted-foreground">Priority:</span>{" "}
            <span className="font-medium">{String(ps.casePriority || "—")}</span>
          </div>
          {ps.waiverFlag && (
            <div>
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                Waiver Needed
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Full data */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Full Screening Data</h4>
        <pre className="text-xs bg-muted/40 p-3 rounded-md overflow-x-auto max-h-60">
          {JSON.stringify(r.data, null, 2)}
        </pre>
      </div>

      {/* Notes */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Admin Notes</h4>
        <div className="flex gap-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes..."
            rows={2}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            onClick={saveNotes}
            disabled={saving || notes === (r.notes || "")}
            className="self-end px-3 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Panel ─────────────────────────────────────
export function PetitionsTab() {
  const [data, setData] = useState<ScreeningRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)
      const supabase = getSupabaseBrowserClient()
      const { data: rows, error: e } = await supabase
        .from("petition_screenings")
        .select("*")
        .order("created_at", { ascending: false })
      if (e) throw new Error(e.message)
      setData((rows || []) as ScreeningRow[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel("admin_petitions")
      .on("postgres_changes", { event: "*", schema: "public", table: "petition_screenings" }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase
      .from("petition_screenings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
    if (e) { alert("Error: " + e.message); return }
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as ScreeningStatus } : r)))
  }

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseBrowserClient()
    const { error: e } = await supabase.from("petition_screenings").delete().eq("id", id)
    if (e) { alert("Error: " + e.message); return }
    setData((prev) => prev.filter((r) => r.id !== id))
  }

  const handleBulkDelete = async (ids: string[]) => {
    const supabase = getSupabaseBrowserClient()
    const { error: e } = await supabase.from("petition_screenings").delete().in("id", ids)
    if (e) { alert("Error: " + e.message); return }
    setData((prev) => prev.filter((r) => !ids.includes(r.id)))
  }

  const handleBulkStatusChange = async (ids: string[], status: string) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase
      .from("petition_screenings")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids)
    if (e) { alert("Error: " + e.message); return }
    setData((prev) =>
      prev.map((r) => (ids.includes(r.id) ? { ...r, status: status as ScreeningStatus } : r))
    )
  }

  return (
    <AdminDataTable<ScreeningRow>
      data={data}
      columns={columns}
      isLoading={isLoading}
      error={error}
      title="Petitions"
      emptyMessage="No petition screenings yet."
      statusField="status"
      statusOptions={statusOptions}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onBulkStatusChange={handleBulkStatusChange}
      onRefresh={load}
      expandedContent={(r) => <PetitionDetail r={r} />}
    />
  )
}
