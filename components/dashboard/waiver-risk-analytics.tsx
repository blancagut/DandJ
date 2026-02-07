"use client"

import { useMemo, useState } from "react"
import { Pie, PieChart, Cell } from "recharts"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ShieldAlert, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import type { WaiverScreeningRecord } from "@/lib/dashboard/waiver-types"
import { getRiskDistribution } from "@/lib/dashboard/waiver-data"

interface WaiverRiskAnalyticsProps {
  records: WaiverScreeningRecord[]
  onSelectCase: (record: WaiverScreeningRecord) => void
}

const pieConfig = {
  Low: { label: "Low", color: "hsl(150, 60%, 50%)" },
  Moderate: { label: "Moderate", color: "hsl(35, 90%, 55%)" },
  High: { label: "High", color: "hsl(0, 70%, 55%)" },
}

export function WaiverRiskAnalytics({ records, onSelectCase }: WaiverRiskAnalyticsProps) {
  const riskDist = useMemo(() => getRiskDistribution(records), [records])
  const [showAll, setShowAll] = useState(false)

  const priorityQueue = useMemo(() => {
    return records
      .filter((r) => r.priorityReview)
      .sort((a, b) => {
        // High risk first, then newest
        const riskOrder = { High: 0, Moderate: 1, Low: 2 }
        const rA = riskOrder[a.waiverScreening.decisionEngineOutput.riskLevel]
        const rB = riskOrder[b.waiverScreening.decisionEngineOutput.riskLevel]
        if (rA !== rB) return rA - rB
        return new Date(b.consultationTimestamp).getTime() - new Date(a.consultationTimestamp).getTime()
      })
  }, [records])

  const multiGroundCount = useMemo(
    () =>
      records.filter((r) =>
        r.waiverScreening.decisionEngineOutput.flags.includes("multi_ground_inadmissibility")
      ).length,
    [records]
  )

  const visibleQueue = showAll ? priorityQueue : priorityQueue.slice(0, 8)

  const riskBadgeColor = (level: string) => {
    if (level === "High") return "bg-red-100 text-red-800 border-red-200"
    if (level === "Moderate") return "bg-amber-100 text-amber-800 border-amber-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block" />
        Case Priority &amp; Risk Analytics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Risk Level Distribution</h3>
          <ChartContainer config={pieConfig} className="h-60 w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={riskDist}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                strokeWidth={2}
              >
                {riskDist.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex justify-center gap-4 mt-2">
            {riskDist.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.fill }} />
                <span className="text-slate-600">{r.name}: {r.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Multi-Ground Card */}
        <Card className="p-5 flex flex-col items-center justify-center text-center border-amber-200 bg-amber-50/50">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
          <div className="text-4xl font-bold text-amber-700">{multiGroundCount}</div>
          <div className="text-sm text-amber-600 font-medium mt-1">Multi-Ground Inadmissibility Cases</div>
          <p className="text-xs text-slate-500 mt-3">Cases with 2+ inadmissibility triggers requiring multi-waiver strategy</p>
        </Card>

        {/* Priority Stats */}
        <Card className="p-5 flex flex-col items-center justify-center text-center border-red-200 bg-red-50/50">
          <ShieldAlert className="w-10 h-10 text-red-500 mb-3" />
          <div className="text-4xl font-bold text-red-700">{priorityQueue.length}</div>
          <div className="text-sm text-red-600 font-medium mt-1">Priority Reviews Pending</div>
          <p className="text-xs text-slate-500 mt-3">Complex factor combinations (Criminal + Fraud, Removal + Fraud)</p>
        </Card>
      </div>

      {/* Priority Review Queue Table */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Priority Review Queue</h3>
          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
            {priorityQueue.length} cases
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="pb-2 font-medium text-slate-500 pr-4">Client</th>
                <th className="pb-2 font-medium text-slate-500 pr-4 hidden md:table-cell">Flags</th>
                <th className="pb-2 font-medium text-slate-500 pr-4">Risk</th>
                <th className="pb-2 font-medium text-slate-500 pr-4 hidden lg:table-cell">Probability</th>
                <th className="pb-2 font-medium text-slate-500 pr-4 hidden md:table-cell">Date</th>
                <th className="pb-2 font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {visibleQueue.map((r) => {
                const out = r.waiverScreening.decisionEngineOutput
                return (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 pr-4">
                      <div className="font-medium text-slate-900">{r.clientName}</div>
                      <div className="text-xs text-slate-400">{r.id}</div>
                    </td>
                    <td className="py-2.5 pr-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {out.flags.slice(0, 3).map((f) => (
                          <Badge key={f} variant="outline" className="text-[10px] px-1.5 py-0">{f}</Badge>
                        ))}
                        {out.flags.length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{out.flags.length - 3}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge className={`text-[10px] border ${riskBadgeColor(out.riskLevel)}`}>{out.riskLevel}</Badge>
                    </td>
                    <td className="py-2.5 pr-4 hidden lg:table-cell text-xs text-slate-600">{out.probabilityLevel}</td>
                    <td className="py-2.5 pr-4 hidden md:table-cell text-xs text-slate-500">
                      {new Date(r.consultationTimestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2.5">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-600" onClick={() => onSelectCase(r)}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {priorityQueue.length > 8 && (
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowAll(!showAll)}>
              {showAll ? <><ChevronUp className="w-3 h-3 mr-1" /> Show Less</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show All ({priorityQueue.length})</>}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
