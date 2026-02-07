"use client"

import { useMemo } from "react"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { WaiverScreeningRecord } from "@/lib/dashboard/waiver-types"
import { getWaiverDistribution, getMonthlyTrend, getFunnelData } from "@/lib/dashboard/waiver-data"

interface WaiverOverviewProps {
  records: WaiverScreeningRecord[]
}

const barConfig = {
  count: { label: "Cases", color: "hsl(210, 80%, 55%)" },
}

const lineConfig = {
  count: { label: "Screenings", color: "hsl(260, 60%, 55%)" },
}

const BAR_COLORS = [
  "hsl(210, 80%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(35, 90%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(260, 60%, 55%)",
]

export function WaiverOverview({ records }: WaiverOverviewProps) {
  const distribution = useMemo(() => getWaiverDistribution(records), [records])
  const trend = useMemo(() => getMonthlyTrend(records), [records])
  const funnel = useMemo(() => getFunnelData(records), [records])

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block" />
        Waiver Case Volume Overview
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiver Type Distribution */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Waiver Type Distribution</h3>
          <ChartContainer config={barConfig} className="h-70 w-full">
            <BarChart data={distribution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {distribution.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Monthly Intake Trend */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Monthly Intake Trend</h3>
          <ChartContainer config={lineConfig} className="h-70 w-full">
            <LineChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(260, 60%, 55%)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "hsl(260, 60%, 55%)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </Card>
      </div>

      {/* Lead Conversion Funnel */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Lead Conversion Funnel</h3>
        <div className="space-y-3">
          {funnel.map((stage) => {
            const maxValue = funnel[0].value || 1
            const pct = Math.round((stage.value / maxValue) * 100)
            return (
              <div key={stage.stage} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{stage.stage}</span>
                  <span className="text-slate-500">{stage.value} ({pct}%)</span>
                </div>
                <div className="h-8 bg-slate-100 rounded-md overflow-hidden">
                  <div
                    className="h-full rounded-md transition-all duration-700 flex items-center justify-end pr-3"
                    style={{ width: `${pct}%`, backgroundColor: stage.fill }}
                  >
                    {pct > 12 && (
                      <span className="text-white text-xs font-bold">{stage.value}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
