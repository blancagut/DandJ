"use client"

import { TrendingUp, TrendingDown, AlertTriangle, ShieldAlert, Users, BarChart3 } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { DashboardKPIs } from "@/lib/dashboard/waiver-types"

interface WaiverKPIHeaderProps {
  kpis: DashboardKPIs
}

export function WaiverKPIHeader({ kpis }: WaiverKPIHeaderProps) {
  const cards = [
    {
      label: "Total Waiver Leads",
      value: kpis.totalLeads,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "High Risk Cases",
      value: kpis.highRiskCases,
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    {
      label: "Priority Reviews",
      value: kpis.priorityReviewsPending,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      label: "Avg Opportunity Score",
      value: kpis.avgOpportunityScore,
      icon: BarChart3,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      suffix: "/100",
    },
    {
      label: "Monthly Growth",
      value: kpis.monthlyGrowthPct,
      icon: kpis.monthlyGrowthPct >= 0 ? TrendingUp : TrendingDown,
      color: kpis.monthlyGrowthPct >= 0 ? "text-green-600" : "text-red-600",
      bg: kpis.monthlyGrowthPct >= 0 ? "bg-green-50" : "bg-red-50",
      border: kpis.monthlyGrowthPct >= 0 ? "border-green-200" : "border-red-200",
      prefix: kpis.monthlyGrowthPct >= 0 ? "+" : "",
      suffix: "%",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className={`p-4 ${c.border} border ${c.bg} transition-shadow hover:shadow-md`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{c.label}</span>
            <c.icon className={`w-4 h-4 ${c.color}`} />
          </div>
          <div className={`text-2xl font-bold ${c.color}`}>
            {c.prefix || ""}{c.value.toLocaleString()}{c.suffix || ""}
          </div>
        </Card>
      ))}
    </div>
  )
}
