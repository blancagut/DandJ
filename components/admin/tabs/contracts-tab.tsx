"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AdminDataTable, type Column, type StatusOption } from "../admin-data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { generateContractPDF } from "@/lib/generate-contract-pdf"
import type { ContractData } from "@/lib/generate-contract-pdf"

// ── Types ──────────────────────────────────────────
type ContractStatus = "signed" | "voided" | "expired"

type H2BContract = {
  id: string
  client_name: string
  client_dob: string
  client_passport: string
  client_country: string
  client_city: string
  client_email: string
  client_phone: string | null
  lawyer_name: string
  contract_day: number
  contract_month: string
  contract_year: number
  client_signature: string
  ip_address: string | null
  user_agent: string | null
  signed_at: string
  created_at: string
  status: ContractStatus
}

const LAWYER_BAR_NUMBERS: Record<string, string> = {
  "Carlos Roberto Díaz": "832871",
}

// ── Status config ──────────────────────────────────
const statusOptions: StatusOption[] = [
  { value: "signed", label: "Signed", color: "bg-green-100 text-green-800" },
  { value: "voided", label: "Voided", color: "bg-red-100 text-red-800" },
  { value: "expired", label: "Expired", color: "bg-gray-100 text-gray-800" },
]

const statusColorMap: Record<string, string> = Object.fromEntries(
  statusOptions.map((s) => [s.value, s.color || ""])
)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

function maskPassport(p: string) {
  if (p.length <= 4) return p
  return p.slice(0, 2) + "•".repeat(p.length - 4) + p.slice(-2)
}

// ── Columns ────────────────────────────────────────
const columns: Column<H2BContract>[] = [
  {
    key: "client_name",
    header: "Client",
    render: (r) => <span className="font-medium">{r.client_name}</span>,
  },
  { key: "client_email", header: "Email" },
  {
    key: "client_country",
    header: "Country",
    render: (r) => <span className="text-xs">{r.client_country}</span>,
  },
  {
    key: "lawyer_name",
    header: "Attorney",
    render: (r) => <span className="text-xs">{r.lawyer_name}</span>,
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
    key: "signed_at",
    header: "Signed",
    render: (r) => (
      <span className="text-xs text-muted-foreground">{formatDate(r.signed_at)}</span>
    ),
  },
]

// ── Expanded Detail ────────────────────────────────
function ContractDetail({ r }: { r: H2BContract }) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownloadPDF() {
    setDownloading(true)
    try {
      const barNumber = LAWYER_BAR_NUMBERS[r.lawyer_name] || "—"
      const pdfData: ContractData = {
        clientName: r.client_name,
        clientDob: r.client_dob,
        clientPassport: r.client_passport,
        clientCountry: r.client_country,
        clientCity: r.client_city,
        clientEmail: r.client_email,
        clientPhone: r.client_phone || "",
        lawyerName: r.lawyer_name,
        lawyerBarNumber: barNumber,
        contractDay: r.contract_day.toString(),
        contractMonth: r.contract_month,
        contractYear: r.contract_year.toString(),
        contractId: r.id,
        signedAt: r.signed_at,
        clientSignature: r.client_signature,
        ipAddress: r.ip_address || undefined,
        userAgent: r.user_agent || undefined,
      }
      await generateContractPDF(pdfData)
    } catch (err) {
      console.error("PDF generation error:", err)
      alert("Error generating PDF")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Client info */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Client Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>{" "}
            <span className="font-medium">{r.client_name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">DOB:</span>{" "}
            <span className="font-medium">{r.client_dob}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Passport:</span>{" "}
            <span className="font-medium">{maskPassport(r.client_passport)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Country:</span>{" "}
            <span className="font-medium">{r.client_country}</span>
          </div>
          <div>
            <span className="text-muted-foreground">City:</span>{" "}
            <span className="font-medium">{r.client_city}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span className="font-medium">{r.client_email}</span>
          </div>
          {r.client_phone && (
            <div>
              <span className="text-muted-foreground">Phone:</span>{" "}
              <span className="font-medium">{r.client_phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contract info */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Contract Details</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Contract ID:</span>{" "}
            <span className="font-medium font-mono text-xs">{r.id}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Date:</span>{" "}
            <span className="font-medium">
              {r.contract_day} de {r.contract_month} de {r.contract_year}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Attorney:</span>{" "}
            <span className="font-medium">{r.lawyer_name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Signed at:</span>{" "}
            <span className="font-medium">
              {new Date(r.signed_at).toLocaleString("en-US")}
            </span>
          </div>
        </div>
      </div>

      {/* Technical info */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Technical Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {r.ip_address && (
            <div>
              <span className="text-muted-foreground">IP Address:</span>{" "}
              <span className="font-medium font-mono text-xs">{r.ip_address}</span>
            </div>
          )}
          {r.user_agent && (
            <div>
              <span className="text-muted-foreground">User-Agent:</span>{" "}
              <span className="font-medium text-xs truncate block max-w-md">
                {r.user_agent}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Download PDF */}
      <div className="pt-2">
        <Button
          onClick={handleDownloadPDF}
          disabled={downloading}
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Generating PDF..." : "Download Contract PDF"}
        </Button>
      </div>
    </div>
  )
}

// ── Main Panel ─────────────────────────────────────
export function ContractsTab() {
  const [data, setData] = useState<H2BContract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)
      const supabase = getSupabaseBrowserClient()
      // @ts-expect-error - No generated types
      const { data: rows, error: e } = await supabase
        .from("h2b_contracts")
        .select("*")
        .order("signed_at", { ascending: false })
      if (e) throw new Error(e.message)
      setData(rows || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Realtime
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel("admin_contracts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "h2b_contracts" },
        () => {
          load()
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [load])

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase
      .from("h2b_contracts")
      .update({ status })
      .eq("id", id)
    if (e) {
      alert("Error: " + e.message)
      return
    }
    setData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: status as ContractStatus } : r))
    )
  }

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase.from("h2b_contracts").delete().eq("id", id)
    if (e) {
      alert("Error deleting: " + e.message)
      return
    }
    const { data: check } = await supabase
      .from("h2b_contracts")
      .select("id")
      .eq("id", id)
      .maybeSingle()
    if (check) {
      alert(
        "Delete failed — check database permissions (RLS policies)."
      )
      return
    }
    setData((prev) => prev.filter((r) => r.id !== id))
  }

  const handleBulkDelete = async (ids: string[]) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase.from("h2b_contracts").delete().in("id", ids)
    if (e) {
      alert("Error deleting: " + e.message)
      return
    }
    const { data: check } = await supabase
      .from("h2b_contracts")
      .select("id")
      .in("id", ids)
    if (check && check.length > 0) {
      alert(
        "Some deletes failed — check database permissions (RLS policies)."
      )
      return
    }
    setData((prev) => prev.filter((r) => !ids.includes(r.id)))
  }

  const handleBulkStatusChange = async (ids: string[], status: string) => {
    const supabase = getSupabaseBrowserClient()
    // @ts-expect-error - No generated types
    const { error: e } = await supabase
      .from("h2b_contracts")
      .update({ status })
      .in("id", ids)
    if (e) {
      alert("Error: " + e.message)
      return
    }
    setData((prev) =>
      prev.map((r) =>
        ids.includes(r.id) ? { ...r, status: status as ContractStatus } : r
      )
    )
  }

  return (
    <AdminDataTable<H2BContract>
      data={data}
      columns={columns}
      isLoading={isLoading}
      error={error}
      title="H-2B Contracts"
      emptyMessage="No signed contracts yet."
      statusField="status"
      statusOptions={statusOptions}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onBulkStatusChange={handleBulkStatusChange}
      onRefresh={load}
      expandedContent={(r) => <ContractDetail r={r} />}
    />
  )
}
