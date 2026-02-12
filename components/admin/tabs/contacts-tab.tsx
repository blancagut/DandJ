"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AdminDataTable, type Column, type StatusOption } from "../admin-data-table"
import { Badge } from "@/components/ui/badge"

// ── Types ──────────────────────────────────────────
type LeadStatus = "new" | "reviewing" | "contacted" | "closed"

type Lead = {
  id: string
  lead_type: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  language: string | null
  case_type: string | null
  message: string | null
  raw: Record<string, unknown> | null
  ip: string | null
  user_agent: string | null
  status: LeadStatus
  created_at: string
  updated_at: string
}

// ── Config ─────────────────────────────────────────
const statusOptions: StatusOption[] = [
  { value: "new", label: "New", color: "bg-yellow-100 text-yellow-800" },
  { value: "reviewing", label: "Reviewing", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Contacted", color: "bg-green-100 text-green-800" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-800" },
]

const statusColorMap: Record<string, string> = Object.fromEntries(
  statusOptions.map((s) => [s.value, s.color || ""])
)

const leadTypeLabels: Record<string, { label: string; color: string }> = {
  contact: { label: "Contact", color: "bg-blue-100 text-blue-800" },
  consultation: { label: "Consultation", color: "bg-purple-100 text-purple-800" },
  h2b: { label: "H-2B", color: "bg-indigo-100 text-indigo-800" },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
}

// ── Columns ────────────────────────────────────────
const columns: Column<Lead>[] = [
  {
    key: "first_name",
    header: "Name",
    render: (r) => (
      <span className="font-medium">
        {[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}
      </span>
    ),
  },
  { key: "email", header: "Email" },
  {
    key: "phone",
    header: "Phone",
    render: (r) => <span>{r.phone || "—"}</span>,
  },
  {
    key: "lead_type",
    header: "Type",
    render: (r) => {
      const t = leadTypeLabels[r.lead_type]
      return t ? (
        <Badge variant="secondary" className={`text-xs ${t.color}`}>
          {t.label}
        </Badge>
      ) : (
        <span className="text-xs">{r.lead_type || "—"}</span>
      )
    },
  },
  {
    key: "language",
    header: "Lang",
    render: (r) => <span className="text-xs">{r.language === "es" ? "ES" : r.language === "en" ? "EN" : r.language || "—"}</span>,
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
function LeadDetail({ r }: { r: Lead }) {
  return (
    <div className="space-y-4">
      {r.message && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Message</h4>
          <p className="text-sm bg-muted/40 p-3 rounded-md whitespace-pre-wrap">{r.message}</p>
        </div>
      )}
      {r.case_type && (
        <div className="text-sm">
          <span className="text-muted-foreground">Case type:</span>{" "}
          <span className="font-medium">{r.case_type}</span>
        </div>
      )}
      {r.raw && Object.keys(r.raw).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Additional Data</h4>
          <pre className="text-xs bg-muted/40 p-3 rounded-md overflow-x-auto">
            {JSON.stringify(r.raw, null, 2)}
          </pre>
        </div>
      )}
      <div className="flex gap-4 text-xs text-muted-foreground">
        {r.ip && <span>IP: {r.ip}</span>}
        {r.user_agent && <span className="truncate max-w-sm">UA: {r.user_agent}</span>}
      </div>
    </div>
  )
}

// ── Main Panel ─────────────────────────────────────
export function ContactsTab() {
  const [data, setData] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)
      const supabase = getSupabaseBrowserClient()
      const { data: rows, error: e } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
      if (e) throw new Error(e.message)
      // Ensure status field exists (table may not have it yet)
      const mapped = (rows || []).map((r: Record<string, unknown>) => ({
        ...r,
        status: (r.status as LeadStatus) || "new",
      })) as Lead[]
      setData(mapped)
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
      .channel("admin_leads")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase
      .from("leads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
    if (e) { alert("Error: " + e.message); return }
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as LeadStatus } : r)))
  }

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseBrowserClient()
    const { error: e } = await supabase.from("leads").delete().eq("id", id)
    if (e) { alert("Error deleting: " + e.message); return }
    // Verify deletion actually happened (RLS may silently block)
    const { data: check } = await supabase.from("leads").select("id").eq("id", id).maybeSingle()
    if (check) { alert("Delete failed — check database permissions (RLS policies). Run the add-delete-policies.sql migration in Supabase SQL Editor."); return }
    setData((prev) => prev.filter((r) => r.id !== id))
  }

  const handleBulkDelete = async (ids: string[]) => {
    const supabase = getSupabaseBrowserClient()
    const { error: e } = await supabase.from("leads").delete().in("id", ids)
    if (e) { alert("Error deleting: " + e.message); return }
    // Verify deletion actually happened (RLS may silently block)
    const { data: check } = await supabase.from("leads").select("id").in("id", ids)
    if (check && check.length > 0) { alert("Some deletes failed — check database permissions (RLS policies). Run the add-delete-policies.sql migration in Supabase SQL Editor."); return }
    setData((prev) => prev.filter((r) => !ids.includes(r.id)))
  }

  const handleBulkStatusChange = async (ids: string[], status: string) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase
      .from("leads")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids)
    if (e) { alert("Error: " + e.message); return }
    setData((prev) =>
      prev.map((r) => (ids.includes(r.id) ? { ...r, status: status as LeadStatus } : r))
    )
  }

  return (
    <AdminDataTable<Lead>
      data={data}
      columns={columns}
      isLoading={isLoading}
      error={error}
      title="Contacts"
      emptyMessage="No contact leads yet."
      statusField="status"
      statusOptions={statusOptions}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onBulkStatusChange={handleBulkStatusChange}
      onRefresh={load}
      expandedContent={(r) => <LeadDetail r={r} />}
    />
  )
}
