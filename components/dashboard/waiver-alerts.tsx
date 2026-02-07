"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, X, ShieldAlert, AlertTriangle, Siren } from "lucide-react"
import type { DashboardAlert } from "@/lib/dashboard/waiver-types"

interface WaiverAlertsProps {
  alerts: DashboardAlert[]
}

const alertIcon = (type: DashboardAlert["type"]) => {
  switch (type) {
    case "priority": return <ShieldAlert className="w-4 h-4 text-red-500" />
    case "high_risk": return <AlertTriangle className="w-4 h-4 text-amber-500" />
    case "criminal_fraud": return <Siren className="w-4 h-4 text-red-600" />
    case "multi_waiver": return <AlertTriangle className="w-4 h-4 text-purple-500" />
    default: return <Bell className="w-4 h-4 text-slate-500" />
  }
}

const alertBorder = (type: DashboardAlert["type"]) => {
  switch (type) {
    case "priority": return "border-l-red-500"
    case "high_risk": return "border-l-amber-500"
    case "criminal_fraud": return "border-l-red-600"
    case "multi_waiver": return "border-l-purple-500"
    default: return "border-l-slate-300"
  }
}

export function WaiverAlerts({ alerts }: WaiverAlertsProps) {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = alerts.filter((a) => !dismissed.has(a.id))
  const unreadCount = visible.length

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="relative h-9 px-3 gap-1.5"
        onClick={() => setOpen(!open)}
      >
        <Bell className="w-4 h-4" />
        <span className="text-xs hidden sm:inline">Alerts</span>
        {unreadCount > 0 && (
          <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px] bg-red-600 text-white border-0">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-11 w-96 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50">
          <div className="sticky top-0 bg-white border-b border-slate-100 p-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Notifications ({unreadCount})</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setOpen(false)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
          {visible.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">No active alerts</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visible.slice(0, 15).map((alert) => (
                <div key={alert.id} className={`p-3 flex items-start gap-3 hover:bg-slate-50 border-l-4 ${alertBorder(alert.type)}`}>
                  <div className="mt-0.5 shrink-0">{alertIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800">{alert.clientName}</div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{alert.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(alert.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={() => dismiss(alert.id)}>
                    <X className="w-3 h-3 text-slate-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
