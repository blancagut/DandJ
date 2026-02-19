"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AdminDataTable, type Column, type StatusOption } from "../admin-data-table"
import { Badge } from "@/components/ui/badge"

type IntakeStatus = "new" | "reviewing" | "contacted" | "completed" | "archived"

type IntakeAnalysis = {
  score?: number
  riskLevel?: string
  eligibilityEstimate?: string
  riskFlags?: string[]
  profile?: string[]
}

type IntakeRow = {
  id: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  data: Record<string, unknown>
  status: IntakeStatus
  notes: string | null
  created_at: string
  updated_at: string
}

const statusOptions: StatusOption[] = [
  { value: "new", label: "New", color: "bg-yellow-100 text-yellow-800" },
  { value: "reviewing", label: "Reviewing", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Contacted", color: "bg-green-100 text-green-800" },
  { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-800" },
]

const statusColorMap: Record<string, string> = Object.fromEntries(statusOptions.map((status) => [status.value, status.color || ""]))

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

function getSummary(data: Record<string, unknown>) {
  const payload = data.h2bIntake as Record<string, unknown> | undefined
  const analysis = payload?.analysis as IntakeAnalysis | undefined

  return {
    score: typeof analysis?.score === "number" ? analysis.score : null,
    riskLevel: analysis?.riskLevel || "—",
    eligibility: analysis?.eligibilityEstimate || "—",
    riskCount: Array.isArray(analysis?.riskFlags) ? analysis.riskFlags.length : 0,
  }
}

const riskColor: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-800",
  moderate: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
}

const columns: Column<IntakeRow>[] = [
  {
    key: "contact_name",
    header: "Name",
    render: (row) => <span className="font-medium">{row.contact_name || "—"}</span>,
  },
  {
    key: "contact_email",
    header: "Email",
    render: (row) => <span>{row.contact_email || "—"}</span>,
  },
  {
    key: "contact_phone",
    header: "Phone",
    render: (row) => <span>{row.contact_phone || "—"}</span>,
  },
  {
    key: "score",
    header: "Score",
    sortable: false,
    searchable: false,
    render: (row) => {
      const summary = getSummary(row.data)
      return <span className="font-semibold">{summary.score == null ? "—" : `${summary.score}%`}</span>
    },
  },
  {
    key: "risk",
    header: "Risk",
    sortable: false,
    searchable: false,
    render: (row) => {
      const summary = getSummary(row.data)
      return (
        <Badge variant="secondary" className={`text-xs capitalize ${riskColor[String(summary.riskLevel)] || ""}`}>
          {summary.riskLevel}
        </Badge>
      )
    },
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <Badge variant="secondary" className={`text-xs ${statusColorMap[row.status] || ""}`}>
        {statusOptions.find((status) => status.value === row.status)?.label || row.status}
      </Badge>
    ),
  },
  {
    key: "created_at",
    header: "Date",
    render: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.created_at)}</span>,
  },
]

function IntakeDetail({ row }: { row: IntakeRow }) {
  const [notes, setNotes] = useState(row.notes || "")
  const [saving, setSaving] = useState(false)

  const payload = row.data.h2bIntake as Record<string, unknown> | undefined
  const analysis = payload?.analysis as IntakeAnalysis | undefined

  async function saveNotes() {
    setSaving(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const query = supabase.from("h2b_intake_submissions")
      // @ts-expect-error - No generated database types for this table yet
      await query.update({ notes, updated_at: new Date().toISOString() }).eq("id", row.id)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {(row.contact_name || row.contact_email || row.contact_phone) && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-800 font-semibold text-xs uppercase tracking-wide">Contact</span>
          <div className="mt-1 flex flex-wrap gap-4 text-sm">
            {row.contact_name && <span>{row.contact_name}</span>}
            {row.contact_email && (
              <a href={`mailto:${row.contact_email}`} className="text-blue-600 underline">
                {row.contact_email}
              </a>
            )}
            {row.contact_phone && (
              <a href={`tel:${row.contact_phone}`} className="text-blue-600 underline">
                {row.contact_phone}
              </a>
            )}
          </div>
        </div>
      )}

      {analysis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Eligibility Score:</span>{" "}
            <span className="font-medium">{analysis.score ?? "—"}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Risk:</span>{" "}
            <Badge variant="secondary" className={`text-xs capitalize ${riskColor[String(analysis.riskLevel)] || ""}`}>
              {analysis.riskLevel ?? "—"}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Eligibility:</span>{" "}
            <span className="font-medium capitalize">{(analysis.eligibilityEstimate || "—").replace("_", " ")}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Risk Flags:</span>{" "}
            <span className="font-medium">{Array.isArray(analysis.riskFlags) ? analysis.riskFlags.length : 0}</span>
          </div>
        </div>
      )}

      {Array.isArray(analysis?.riskFlags) && analysis.riskFlags.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Risk Flags</h4>
          <div className="flex flex-wrap gap-1">
            {analysis.riskFlags.map((flag) => (
              <Badge key={flag} variant="outline" className="text-xs text-red-700 border-red-200 bg-red-50">
                {flag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold mb-2">Full Intake Data</h4>
        <pre className="text-xs bg-muted/40 p-3 rounded-md overflow-x-auto max-h-72">{JSON.stringify(row.data, null, 2)}</pre>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Admin Notes</h4>
        <div className="flex gap-2">
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add notes..."
            rows={2}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            onClick={saveNotes}
            disabled={saving || notes === (row.notes || "")}
            className="self-end px-3 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

export function H2BIntakeTab() {
  const [data, setData] = useState<IntakeRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)
      const supabase = getSupabaseBrowserClient()
      const { data: rows, error: requestError } = await supabase
        .from("h2b_intake_submissions")
        .select("*")
        .order("created_at", { ascending: false })
      if (requestError) throw new Error(requestError.message)
      setData((rows || []) as IntakeRow[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel("admin_h2b_intakes")
      .on("postgres_changes", { event: "*", schema: "public", table: "h2b_intake_submissions" }, () => load())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [load])

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = getSupabaseBrowserClient()
    const query = supabase.from("h2b_intake_submissions")
    // @ts-expect-error - No generated database types for this table yet
    const { error: requestError } = await query.update({ status, updated_at: new Date().toISOString() }).eq("id", id)

    if (requestError) {
      alert(`Error: ${requestError.message}`)
      return
    }

    setData((prev) => prev.map((row) => (row.id === id ? { ...row, status: status as IntakeStatus } : row)))
  }

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseBrowserClient()
    const { error: requestError } = await supabase.from("h2b_intake_submissions").delete().eq("id", id)
    if (requestError) {
      alert(`Error deleting: ${requestError.message}`)
      return
    }

    const { data: check } = await supabase.from("h2b_intake_submissions").select("id").eq("id", id).maybeSingle()
    if (check) {
      alert("Delete failed — check database permissions (RLS policies).")
      return
    }

    setData((prev) => prev.filter((row) => row.id !== id))
  }

  const handleBulkDelete = async (ids: string[]) => {
    const supabase = getSupabaseBrowserClient()
    const { error: requestError } = await supabase.from("h2b_intake_submissions").delete().in("id", ids)

    if (requestError) {
      alert(`Error deleting: ${requestError.message}`)
      return
    }

    const { data: check } = await supabase.from("h2b_intake_submissions").select("id").in("id", ids)
    if (check && check.length > 0) {
      alert("Some deletes failed — check database permissions (RLS policies).")
      return
    }

    setData((prev) => prev.filter((row) => !ids.includes(row.id)))
  }

  const handleBulkStatusChange = async (ids: string[], status: string) => {
    const supabase = getSupabaseBrowserClient()
    const query = supabase.from("h2b_intake_submissions")
    // @ts-expect-error - No generated database types for this table yet
    const { error: requestError } = await query.update({ status, updated_at: new Date().toISOString() }).in("id", ids)

    if (requestError) {
      alert(`Error: ${requestError.message}`)
      return
    }

    setData((prev) => prev.map((row) => (ids.includes(row.id) ? { ...row, status: status as IntakeStatus } : row)))
  }

  return (
    <AdminDataTable<IntakeRow>
      data={data}
      columns={columns}
      isLoading={isLoading}
      error={error}
      title="H-2B Intake"
      emptyMessage="No H-2B intake submissions yet."
      statusField="status"
      statusOptions={statusOptions}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onBulkStatusChange={handleBulkStatusChange}
      onRefresh={load}
      expandedContent={(row) => <IntakeDetail row={row} />}
    />
  )
}
