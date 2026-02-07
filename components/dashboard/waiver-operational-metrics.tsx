"use client"

import { useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import type { WaiverScreeningRecord } from "@/lib/dashboard/waiver-types"
import { getCompletionRate, getAvgCompletionTime, getDropOffSteps } from "@/lib/dashboard/waiver-data"

interface WaiverOperationalMetricsProps {
  records: WaiverScreeningRecord[]
}

const dropoffConfig = {
  dropoffs: { label: "Drop-offs", color: "hsl(0, 70%, 55%)" },
}

export function WaiverOperationalMetrics({ records }: WaiverOperationalMetricsProps) {
  const completionRate = useMemo(() => getCompletionRate(records), [records])
  const avgTime = useMemo(() => getAvgCompletionTime(records), [records])
  const dropoffs = useMemo(() => getDropOffSteps(records), [records])

  const completionColor = completionRate >= 80 ? "text-green-600" : completionRate >= 60 ? "text-amber-600" : "text-red-600"
  const completionBg = completionRate >= 80 ? "bg-green-500" : completionRate >= 60 ? "bg-amber-500" : "bg-red-500"

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block" />
        Operational Performance Metrics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completion Rate */}
        <Card className="p-5 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
          <div className={`text-4xl font-bold ${completionColor}`}>{completionRate}%</div>
          <div className="text-sm text-slate-600 font-medium mt-1">Form Completion Rate</div>
          <div className="w-full mt-4">
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${completionBg}`} style={{ width: `${completionRate}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </Card>

        {/* Avg Time */}
        <Card className="p-5 flex flex-col items-center justify-center text-center">
          <Clock className="w-8 h-8 text-blue-500 mb-3" />
          <div className="text-4xl font-bold text-blue-600">{avgTime}</div>
          <div className="text-sm text-slate-600 font-medium mt-1">Avg Minutes to Complete</div>
          <p className="text-xs text-slate-400 mt-3">Time from wizard start to final submission</p>
        </Card>

        {/* Incomplete count */}
        <Card className="p-5 flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />
          <div className="text-4xl font-bold text-amber-600">
            {records.filter((r) => !r.intakeCompleted).length}
          </div>
          <div className="text-sm text-slate-600 font-medium mt-1">Incomplete Screenings</div>
          <p className="text-xs text-slate-400 mt-3">Users who abandoned the wizard before completion</p>
        </Card>
      </div>

      {/* Drop-off Step Chart */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Drop-Off by Wizard Step</h3>
        <ChartContainer config={dropoffConfig} className="h-56 w-full">
          <BarChart
            data={dropoffs}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
            <YAxis type="category" dataKey="step" tick={{ fontSize: 11 }} width={55} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="dropoffs" fill="hsl(0, 70%, 60%)" radius={[0, 6, 6, 0]} maxBarSize={24} />
          </BarChart>
        </ChartContainer>
      </Card>
    </div>
  )
}
