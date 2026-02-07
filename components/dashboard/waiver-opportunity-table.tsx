"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trophy, ChevronDown, ChevronUp, Star } from "lucide-react"
import type { WaiverScreeningRecord } from "@/lib/dashboard/waiver-types"
import { getTopLeads } from "@/lib/dashboard/waiver-data"

interface WaiverOpportunityTableProps {
  records: WaiverScreeningRecord[]
  onSelectCase: (record: WaiverScreeningRecord) => void
}

function scoreColor(score: number) {
  if (score >= 75) return "text-green-700 bg-green-100"
  if (score >= 50) return "text-amber-700 bg-amber-100"
  return "text-slate-700 bg-slate-100"
}

function scoreBar(score: number) {
  if (score >= 75) return "bg-green-500"
  if (score >= 50) return "bg-amber-500"
  return "bg-slate-400"
}

const riskBadgeColor = (level: string) => {
  if (level === "High") return "bg-red-100 text-red-800 border-red-200"
  if (level === "Moderate") return "bg-amber-100 text-amber-800 border-amber-200"
  return "bg-green-100 text-green-800 border-green-200"
}

export function WaiverOpportunityTable({ records, onSelectCase }: WaiverOpportunityTableProps) {
  const [showAll, setShowAll] = useState(false)
  const leads = useMemo(() => getTopLeads(records, 50), [records])

  const visible = showAll ? leads : leads.slice(0, 12)

  // Find the full record for drill-down
  const findRecord = (clientId: string) => records.find((r) => r.id === clientId)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-purple-500 rounded-full inline-block" />
        Attorney Opportunity Scoring
      </h2>

      {/* LOS Formula Card */}
      <Card className="p-4 bg-purple-50/50 border-purple-200">
        <div className="flex items-start gap-3">
          <Trophy className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-purple-900">Lead Opportunity Score (LOS)</h3>
            <p className="text-xs text-purple-700 mt-1">
              Probability weight (+15 to +30) + Risk complexity (+5 to +25) + Multi-waiver bonus (+20) + Priority bonus (+10) + Hardship indicators (+10) = Score 0–100
            </p>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Top Opportunity Leads</h3>
          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
            {leads.length} ranked
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="pb-2 font-medium text-slate-500 pr-4 w-8">#</th>
                <th className="pb-2 font-medium text-slate-500 pr-4">Client</th>
                <th className="pb-2 font-medium text-slate-500 pr-4">LOS</th>
                <th className="pb-2 font-medium text-slate-500 pr-4 hidden md:table-cell">Waivers</th>
                <th className="pb-2 font-medium text-slate-500 pr-4">Risk</th>
                <th className="pb-2 font-medium text-slate-500 pr-4 hidden lg:table-cell">Last Activity</th>
                <th className="pb-2 font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((lead, i) => (
                <tr key={lead.clientId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 pr-4 text-slate-400 font-mono text-xs">
                    {i < 3 ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : i + 1}
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="font-medium text-slate-900">{lead.clientName}</div>
                    <div className="text-xs text-slate-400">{lead.clientId}</div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${scoreBar(lead.score)}`} style={{ width: `${lead.score}%` }} />
                      </div>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreColor(lead.score)}`}>{lead.score}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {lead.waivers.slice(0, 2).map((w) => (
                        <Badge key={w} variant="outline" className="text-[10px] px-1.5 py-0">{w}</Badge>
                      ))}
                      {lead.waivers.length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{lead.waivers.length - 2}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge className={`text-[10px] border ${riskBadgeColor(lead.riskLevel)}`}>{lead.riskLevel}</Badge>
                  </td>
                  <td className="py-2.5 pr-4 hidden lg:table-cell text-xs text-slate-500">
                    {new Date(lead.lastActivity).toLocaleDateString()}
                  </td>
                  <td className="py-2.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-blue-600"
                      onClick={() => {
                        const rec = findRecord(lead.clientId)
                        if (rec) onSelectCase(rec)
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leads.length > 12 && (
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowAll(!showAll)}>
              {showAll ? <><ChevronUp className="w-3 h-3 mr-1" /> Show Less</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show All ({leads.length})</>}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
