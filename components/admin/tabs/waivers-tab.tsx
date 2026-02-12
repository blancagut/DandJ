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

// ── Helpers ────────────────────────────────────────
function getWaiverSummary(data: Record<string, unknown>) {
  const ws = data.waiverScreening as Record<string, unknown> | undefined
  if (!ws) return { riskLevel: "—", probabilityLevel: "—", flagCount: 0, location: "—" }
  const deo = ws.decisionEngineOutput as Record<string, unknown> | undefined
  return {
    riskLevel: String(deo?.riskLevel || "—"),
    probabilityLevel: String(deo?.probabilityLevel || "—"),
    flagCount: Array.isArray(deo?.flags) ? (deo.flags as unknown[]).length : 0,
    location: String(ws.locationContext || "—"),
  }
}

const riskColors: Record<string, string> = {
  Low: "bg-green-100 text-green-800",
  Moderate: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
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
    key: "risk",
    header: "Risk",
    sortable: false,
    searchable: false,
    render: (r) => {
      const s = getWaiverSummary(r.data)
      return (
        <Badge variant="secondary" className={`text-xs ${riskColors[s.riskLevel] || ""}`}>
          {s.riskLevel}
        </Badge>
      )
    },
  },
  {
    key: "probability",
    header: "Probability",
    sortable: false,
    searchable: false,
    render: (r) => {
      const s = getWaiverSummary(r.data)
      return <span className="text-xs">{s.probabilityLevel}</span>
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
function WaiverDetail({ r }: { r: ScreeningRow }) {
  const [notes, setNotes] = useState(r.notes || "")
  const [saving, setSaving] = useState(false)

  async function saveNotes() {
    setSaving(true)
    try {
      const supabase = getSupabaseBrowserClient()
      // @ts-expect-error - No generated types
      await supabase
        .from("waiver_screenings")
        .update({ notes, updated_at: new Date().toISOString() })
        .eq("id", r.id)
    } finally {
      setSaving(false)
    }
  }

  const ws = r.data.waiverScreening as Record<string, unknown> | undefined
  const deo = ws?.decisionEngineOutput as Record<string, unknown> | undefined

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
      {ws && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Location:</span>{" "}
            <span className="font-medium">{String(ws.locationContext || "—")}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Context:</span>{" "}
            <span className="font-medium">{String(ws.contextType || "—")}</span>
          </div>
          {deo && (
            <>
              <div>
                <span className="text-muted-foreground">Risk:</span>{" "}
                <Badge variant="secondary" className={`text-xs ${riskColors[String(deo.riskLevel)] || ""}`}>
                  {String(deo.riskLevel)}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Probability:</span>{" "}
                <span className="font-medium">{String(deo.probabilityLevel)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Recommended waivers */}
      {deo?.recommendedWaivers && Array.isArray(deo.recommendedWaivers) && (deo.recommendedWaivers as string[]).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Recommended Waivers</h4>
          <div className="flex flex-wrap gap-1">
            {(deo.recommendedWaivers as string[]).map((w) => (
              <Badge key={w} variant="outline" className="text-xs">
                {w}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Flags */}
      {deo?.flags && Array.isArray(deo.flags) && (deo.flags as string[]).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Flags</h4>
          <div className="flex flex-wrap gap-1">
            {(deo.flags as string[]).map((f) => (
              <Badge key={f} variant="outline" className="text-xs text-red-700 border-red-200 bg-red-50">
                {f}
              </Badge>
            ))}
          </div>
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
export function WaiversTab() {
  const [data, setData] = useState<ScreeningRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)
      const supabase = getSupabaseBrowserClient()
      const { data: rows, error: e } = await supabase
        .from("waiver_screenings")
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
      .channel("admin_waivers")
      .on("postgres_changes", { event: "*", schema: "public", table: "waiver_screenings" }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase
      .from("waiver_screenings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
    if (e) { alert("Error: " + e.message); return }
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as ScreeningStatus } : r)))
  }

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseBrowserClient()
    const { error: e } = await supabase.from("waiver_screenings").delete().eq("id", id)
    if (e) { alert("Error deleting: " + e.message); return }
    // Verify deletion actually happened (RLS may silently block)
    const { data: check } = await supabase.from("waiver_screenings").select("id").eq("id", id).maybeSingle()
    if (check) { alert("Delete failed — check database permissions (RLS policies). Run the add-delete-policies.sql migration in Supabase SQL Editor."); return }
    setData((prev) => prev.filter((r) => r.id !== id))
  }

  const handleBulkDelete = async (ids: string[]) => {
    const supabase = getSupabaseBrowserClient()
    const { error: e } = await supabase.from("waiver_screenings").delete().in("id", ids)
    if (e) { alert("Error deleting: " + e.message); return }
    // Verify deletion actually happened (RLS may silently block)
    const { data: check } = await supabase.from("waiver_screenings").select("id").in("id", ids)
    if (check && check.length > 0) { alert("Some deletes failed — check database permissions (RLS policies). Run the add-delete-policies.sql migration in Supabase SQL Editor."); return }
    setData((prev) => prev.filter((r) => !ids.includes(r.id)))
  }

  const handleBulkStatusChange = async (ids: string[], status: string) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase
      .from("waiver_screenings")
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
      title="Waivers"
      emptyMessage="No waiver screenings yet."
      statusField="status"
      statusOptions={statusOptions}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onBulkStatusChange={handleBulkStatusChange}
      onRefresh={load}
      expandedContent={(r) => <WaiverDetail r={r} />}
    />
  )
}
