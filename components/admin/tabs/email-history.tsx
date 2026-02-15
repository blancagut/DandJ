"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────
interface EmailLog {
  id: string
  subject: string
  sender_email: string
  recipient_count: number
  recipient_source: string | null
  status: string
  created_at: string
  error_message: string | null
}

interface EmailLogDetail extends EmailLog {
  body_html: string
  recipient_emails: string[]
  resend_ids: string[]
}

// ─── Helpers ─────────────────────────────────────────────────
function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function relativeTime(iso: string) {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
  sent: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Sent",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  failed: {
    icon: <XCircle className="h-3.5 w-3.5" />,
    label: "Failed",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  partial: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    label: "Partial",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
}

const SOURCE_LABELS: Record<string, string> = {
  all: "All Users",
  consultations: "Consultations",
  leads: "Contacts",
  petitions: "Petitions",
  waivers: "Waivers",
  work: "Work Visas",
  contracts: "Contracts",
  chat: "Chat",
}

// ─── Component ───────────────────────────────────────────────
export function EmailHistory({ refreshKey }: { refreshKey?: number }) {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<EmailLogDetail | null>(null)
  const [detailPreviewHtml, setDetailPreviewHtml] = useState("")

  const pageSize = 15
  const totalPages = Math.ceil(totalCount / pageSize)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (search) params.set("search", search)

      const res = await fetch(`/api/admin/email-logs?${params}`)
      const data = await res.json()
      setLogs(data.logs ?? [])
      setTotalCount(data.totalCount ?? 0)
    } catch {
      console.error("Failed to load email logs")
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs, refreshKey])

  // Debounced search
  const [searchInput, setSearchInput] = useState("")
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // View detail
  const viewDetail = async (id: string) => {
    setDetailLoading(true)
    setDetailOpen(true)
    setDetail(null)
    setDetailPreviewHtml("")
    try {
      const res = await fetch("/api/admin/email-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.log) {
        setDetail(data.log)
        // Generate preview
        const previewRes = await fetch("/api/admin/email-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: data.log.subject,
            bodyHtml: data.log.body_html,
          }),
        })
        const html = await previewRes.text()
        setDetailPreviewHtml(html)
      }
    } catch {
      console.error("Failed to load email detail")
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header / Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by subject..."
            className="pl-9 h-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="w-[120px]">Recipients</TableHead>
              <TableHead className="w-[100px]">Source</TableHead>
              <TableHead className="w-[90px]">Status</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading…</p>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    {search ? "No emails match your search" : "No emails sent yet"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const statusCfg = STATUS_CONFIG[log.status] ?? STATUS_CONFIG.sent
                return (
                  <TableRow key={log.id} className="group">
                    <TableCell className="text-xs text-muted-foreground">
                      {relativeTime(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium truncate max-w-[300px]">
                        {log.subject}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{log.recipient_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {SOURCE_LABELS[log.recipient_source ?? "all"] ?? log.recipient_source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] gap-1 ${statusCfg.className}`}
                      >
                        {statusCfg.icon}
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => viewDetail(log.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of{" "}
            {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── Detail Dialog ────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {detail ? detail.subject : "Loading…"}
            </DialogTitle>
            <DialogDescription>
              {detail && (
                <span className="flex items-center gap-3 flex-wrap">
                  <span>{formatDate(detail.created_at)}</span>
                  <span>•</span>
                  <span>{detail.recipient_count} recipients</span>
                  <span>•</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] gap-1 ${(STATUS_CONFIG[detail.status] ?? STATUS_CONFIG.sent).className}`}
                  >
                    {(STATUS_CONFIG[detail.status] ?? STATUS_CONFIG.sent).icon}
                    {(STATUS_CONFIG[detail.status] ?? STATUS_CONFIG.sent).label}
                  </Badge>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : detail ? (
            <div className="flex-1 overflow-auto space-y-4">
              {/* Email preview */}
              <div className="border rounded-lg bg-gray-100 overflow-hidden">
                <iframe
                  srcDoc={detailPreviewHtml}
                  className="w-full min-h-[400px] border-0"
                  title="Email preview"
                  sandbox="allow-same-origin"
                />
              </div>

              {/* Recipient list */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">
                  Recipients ({detail.recipient_emails?.length ?? 0})
                </p>
                <ScrollArea className="h-[120px] rounded-lg border p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {(detail.recipient_emails ?? []).map((email: string) => (
                      <Badge key={email} variant="secondary" className="text-[11px] font-normal">
                        {email}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {detail.error_message && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {detail.error_message}
                  </p>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
