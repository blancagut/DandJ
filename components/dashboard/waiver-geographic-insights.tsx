"use client"

import { useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Globe } from "lucide-react"
import type { WaiverScreeningRecord } from "@/lib/dashboard/waiver-types"
import { getCountryDistribution, getCountryWaiverBreakdown } from "@/lib/dashboard/waiver-data"

interface WaiverGeographicInsightsProps {
  records: WaiverScreeningRecord[]
}

const stackedConfig = {
  "I-601": { label: "I-601", color: "hsl(210, 80%, 55%)" },
  "I-601A": { label: "I-601A", color: "hsl(150, 60%, 45%)" },
  "I-212": { label: "I-212", color: "hsl(35, 90%, 55%)" },
  "I-192": { label: "I-192", color: "hsl(0, 70%, 55%)" },
}

const GEO_COLORS = [
  "hsl(210, 80%, 55%)", "hsl(150, 60%, 45%)", "hsl(35, 90%, 55%)",
  "hsl(0, 70%, 55%)", "hsl(260, 60%, 55%)", "hsl(180, 60%, 45%)",
  "hsl(320, 60%, 55%)", "hsl(45, 80%, 50%)", "hsl(90, 50%, 50%)",
  "hsl(200, 70%, 50%)",
]

export function WaiverGeographicInsights({ records }: WaiverGeographicInsightsProps) {
  const countryDist = useMemo(() => getCountryDistribution(records), [records])
  const countryWaiverData = useMemo(() => getCountryWaiverBreakdown(records), [records])

  const topCountries = countryDist.slice(0, 10)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-teal-500 rounded-full inline-block" />
        Geographic &amp; Market Intelligence
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Heat Map (simulated as horizontal bar) */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-700">Client Origin Distribution</h3>
          </div>
          <div className="space-y-2.5">
            {topCountries.map((entry, i) => {
              const maxCount = topCountries[0]?.count || 1
              const pct = Math.round((entry.count / maxCount) * 100)
              return (
                <div key={entry.country} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{entry.country}</span>
                    <span className="text-slate-500">{entry.count} leads</span>
                  </div>
                  <div className="h-5 bg-slate-100 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500 flex items-center pl-2"
                      style={{ width: `${pct}%`, backgroundColor: GEO_COLORS[i % GEO_COLORS.length] }}
                    >
                      {pct > 20 && <span className="text-white text-[10px] font-bold">{pct}%</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {countryDist.length > 10 && (
            <p className="text-xs text-slate-400 mt-3 text-center">Showing top 10 of {countryDist.length} countries</p>
          )}
        </Card>

        {/* Stacked Bar: Waiver Type by Country */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Waiver Type by Country (Top 10)</h3>
          <ChartContainer config={stackedConfig} className="h-80 w-full">
            <BarChart
              data={countryWaiverData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis type="category" dataKey="country" tick={{ fontSize: 10 }} width={55} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="I-601" stackId="a" fill="hsl(210, 80%, 55%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="I-601A" stackId="a" fill="hsl(150, 60%, 45%)" />
              <Bar dataKey="I-212" stackId="a" fill="hsl(35, 90%, 55%)" />
              <Bar dataKey="I-192" stackId="a" fill="hsl(0, 70%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>
    </div>
  )
}
