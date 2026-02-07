"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, RotateCcw } from "lucide-react"
import type { DashboardFilters } from "@/lib/dashboard/waiver-types"
import { initialFilters } from "@/lib/dashboard/waiver-types"

interface WaiverFiltersProps {
  filters: DashboardFilters
  onChange: (filters: DashboardFilters) => void
  countries: string[]
  activeCount: number
}

export function WaiverFilters({ filters, onChange, countries, activeCount }: WaiverFiltersProps) {
  const update = (partial: Partial<DashboardFilters>) => {
    onChange({ ...filters, ...partial })
  }

  const reset = () => onChange(initialFilters)

  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(initialFilters)

  const selectClass =
    "h-8 text-xs rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
          {hasActiveFilters && (
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{activeCount} results</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-slate-500" onClick={reset}>
              <RotateCcw className="w-3 h-3 mr-1" /> Reset
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
        {/* Waiver Type */}
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-400 font-medium">Waiver Type</Label>
          <select
            className={selectClass}
            value={filters.waiverType}
            onChange={(e) => update({ waiverType: e.target.value })}
          >
            <option value="all">All</option>
            <option value="I-601">I-601</option>
            <option value="I-601A">I-601A</option>
            <option value="I-212">I-212</option>
            <option value="I-192">I-192</option>
          </select>
        </div>

        {/* Risk Level */}
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-400 font-medium">Risk Level</Label>
          <select
            className={selectClass}
            value={filters.riskLevel}
            onChange={(e) => update({ riskLevel: e.target.value })}
          >
            <option value="all">All</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Probability */}
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-400 font-medium">Probability</Label>
          <select
            className={selectClass}
            value={filters.probabilityLevel}
            onChange={(e) => update({ probabilityLevel: e.target.value })}
          >
            <option value="all">All</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Attorney Review Required">Attorney Review</option>
          </select>
        </div>

        {/* Country */}
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-400 font-medium">Country</Label>
          <select
            className={selectClass}
            value={filters.country}
            onChange={(e) => update({ country: e.target.value })}
          >
            <option value="all">All</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-400 font-medium">From</Label>
          <Input
            type="date"
            className="h-8 text-xs"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
          />
        </div>

        {/* Date To */}
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-slate-400 font-medium">To</Label>
          <Input
            type="date"
            className="h-8 text-xs"
            value={filters.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Checkbox
              id="priority-filter"
              checked={filters.priorityOnly}
              onCheckedChange={(v) => update({ priorityOnly: !!v })}
            />
            <label htmlFor="priority-filter" className="text-[10px] text-slate-600 cursor-pointer">Priority Only</label>
          </div>
          <div className="flex items-center gap-1.5">
            <Checkbox
              id="multi-filter"
              checked={filters.multiGroundOnly}
              onCheckedChange={(v) => update({ multiGroundOnly: !!v })}
            />
            <label htmlFor="multi-filter" className="text-[10px] text-slate-600 cursor-pointer">Multi-Ground</label>
          </div>
        </div>
      </div>
    </div>
  )
}
