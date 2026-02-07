"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RefreshCw, Shield } from "lucide-react"
import Link from "next/link"

import { WaiverKPIHeader } from "@/components/dashboard/waiver-kpi-header"
import { WaiverOverview } from "@/components/dashboard/waiver-overview"
import { WaiverRiskAnalytics } from "@/components/dashboard/waiver-risk-analytics"
import { WaiverOpportunityTable } from "@/components/dashboard/waiver-opportunity-table"
import { WaiverGeographicInsights } from "@/components/dashboard/waiver-geographic-insights"
import { WaiverOperationalMetrics } from "@/components/dashboard/waiver-operational-metrics"
import { WaiverFilters } from "@/components/dashboard/waiver-filters"
import { WaiverAlerts } from "@/components/dashboard/waiver-alerts"
import { CaseDrillDown } from "@/components/dashboard/case-drill-down"

import type { DashboardFilters, WaiverScreeningRecord } from "@/lib/dashboard/waiver-types"
import { initialFilters } from "@/lib/dashboard/waiver-types"
import {
  getMockWaiverRecords,
  applyFilters,
  computeKPIs,
  generateAlerts,
  getUniqueCountries,
} from "@/lib/dashboard/waiver-data"

export default function WaiverDashboardPage() {
  const allRecords = useMemo(() => getMockWaiverRecords(), [])
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)
  const [selectedCase, setSelectedCase] = useState<WaiverScreeningRecord | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const filteredRecords = useMemo(() => applyFilters(allRecords, filters), [allRecords, filters])
  const kpis = useMemo(() => computeKPIs(filteredRecords), [filteredRecords])
  const alerts = useMemo(() => generateAlerts(allRecords), [allRecords])
  const countries = useMemo(() => getUniqueCountries(allRecords), [allRecords])

  const handleSelectCase = useCallback((record: WaiverScreeningRecord) => {
    setSelectedCase(record)
  }, [])

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
                <ArrowLeft className="w-4 h-4" /> Admin
              </Button>
            </Link>
            <div className="hidden sm:block w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h1 className="text-lg font-bold text-slate-900">Waiver Lead Intelligence</h1>
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 hidden sm:inline-flex">
                Attorney Dashboard
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WaiverAlerts alerts={alerts} />
            <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={handleRefresh}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-xs hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 space-y-8" key={refreshKey}>
        {/* KPI Ribbon */}
        <WaiverKPIHeader kpis={kpis} />

        {/* Filter Controls */}
        <WaiverFilters
          filters={filters}
          onChange={setFilters}
          countries={countries}
          activeCount={filteredRecords.length}
        />

        {/* Zone 1: Volume Overview */}
        <WaiverOverview records={filteredRecords} />

        {/* Zone 2: Risk Analytics */}
        <WaiverRiskAnalytics records={filteredRecords} onSelectCase={handleSelectCase} />

        {/* Zone 3: Opportunity Scoring */}
        <WaiverOpportunityTable records={filteredRecords} onSelectCase={handleSelectCase} />

        {/* Zone 4: Geographic Intelligence */}
        <WaiverGeographicInsights records={filteredRecords} />

        {/* Zone 5: Operational Metrics */}
        <WaiverOperationalMetrics records={filteredRecords} />

        {/* Footer */}
        <div className="text-center py-6 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Waiver Lead Intelligence Dashboard — Diaz &amp; Johnson Attorneys at Law
          </p>
          <p className="text-[10px] text-slate-300 mt-1">
            Data is for attorney analysis only. Not legal advice. All cases require licensed attorney review.
          </p>
        </div>
      </div>

      {/* Drill-Down Panel */}
      {selectedCase && (
        <CaseDrillDown record={selectedCase} onClose={() => setSelectedCase(null)} />
      )}
    </div>
  )
}
