"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useWaiverTranslation } from "@/lib/waiver-i18n"
import { WaiverLanguageSelector } from "@/components/waiver-language-selector"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface WaiverSavedData {
  waiverScreening: {
    locationContext: string
    contextType: string
    unlawfulPresence: {
      overstayed: boolean | null
      duration: string
      departed: boolean | null
    }
    removalHistory: {
      removed: boolean | null
      voluntary: boolean | null
      activeOrder: boolean | null
      expedited: boolean | null
    }
    fraudIndicators: {
      statements: boolean | null
      documents: boolean | null
      identity: boolean | null
      priorDenial: boolean | null
    }
    criminalIndicators: {
      arrests: boolean | null
      convictions: boolean | null
      offenses: string[]
    }
    hardshipFactors: {
      relatives: string[]
      types: string[]
    }
    decisionEngineOutput: {
      recommendedWaivers: string[]
      probabilityLevel: "High" | "Moderate" | "Attorney Review Required"
      riskLevel: "Low" | "Moderate" | "High"
      flags: string[]
      nextStepGuidance: string[]
    }
    timestamp: string
  }
}

const riskStyles: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  Low: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
  Moderate: { bg: "bg-amber-100", text: "text-amber-800", icon: AlertTriangle },
  High: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
}

export function WaiverScreeningPanel() {
  const { ready } = useWaiverTranslation()
  const [expandedCase, setExpandedCase] = useState<number | null>(null)
  const [cases, setCases] = useState<(WaiverSavedData & { contactName?: string; contactEmail?: string; contactPhone?: string })[]>([])  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCases = useCallback(async () => {
    try {
      setError(null)
      const supabase = getSupabaseBrowserClient()

      const { data, error: queryError } = await supabase
        .from("waiver_screenings")
        .select("id, data, status, contact_name, contact_email, contact_phone, created_at")
        .order("created_at", { ascending: false })

      if (queryError) {
        console.error("Query error:", queryError)
        setError("Failed to load waiver screening results.")
        return
      }

      const parsed = (data || []).map((row: { data: WaiverSavedData; contact_name?: string; contact_email?: string; contact_phone?: string }) => ({
        ...row.data,
        contactName: row.contact_name,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
      }))
      setCases(parsed)
    } catch (err) {
      console.error("Load error:", err)
      setError("Connection error.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCases()
  }, [loadCases])

  if (!ready || isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-destructive">{error}</p>
        <button onClick={loadCases} className="mt-2 text-xs underline text-muted-foreground">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Panel Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold">Waiver Screenings</h2>
          <Badge variant="secondary" className="text-xs">{cases.length}</Badge>
        </div>
        <WaiverLanguageSelector />
      </div>

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No waiver screening submissions yet.
        </div>
      ) : (
        <div className="divide-y">
          {cases.map((caseData, idx) => {
            const ws = caseData.waiverScreening
            const isExpanded = expandedCase === idx
            const risk = ws.decisionEngineOutput.riskLevel
            const style = riskStyles[risk] || riskStyles.Low
            const RiskIcon = style.icon

            return (
              <div key={idx} className="transition-colors hover:bg-muted/30">
                {/* Collapsed Row */}
                <button
                  onClick={() => setExpandedCase(isExpanded ? null : idx)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">Case #{idx + 1}</span>
                      {caseData.contactName && <span className="text-sm font-semibold text-slate-900">{caseData.contactName}</span>}
                      <Badge className={cn("text-xs", style.bg, style.text)}>
                        <RiskIcon className="w-3 h-3 mr-1" />
                        Risk: {risk}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {ws.decisionEngineOutput.probabilityLevel}
                      </Badge>
                      {ws.decisionEngineOutput.flags.length > 0 && (
                        <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                          <AlertCircle className="w-3 h-3 mr-1" /> {ws.decisionEngineOutput.flags.length} flags
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Location: {ws.locationContext} | Context: {ws.contextType} — {new Date(ws.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Contact Info */}
                    {(caseData.contactName || caseData.contactEmail || caseData.contactPhone) && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-blue-800 font-semibold text-xs uppercase tracking-wide">Contact Info</span>
                        <div className="mt-1 flex flex-wrap gap-4 text-sm">
                          {caseData.contactName && <span className="text-slate-900">{caseData.contactName}</span>}
                          {caseData.contactEmail && <a href={`mailto:${caseData.contactEmail}`} className="text-blue-600 underline">{caseData.contactEmail}</a>}
                          {caseData.contactPhone && <a href={`tel:${caseData.contactPhone}`} className="text-blue-600 underline">{caseData.contactPhone}</a>}
                        </div>
                      </div>
                    )}
                    {/* Recommended Waivers */}
                    <Card className="p-3 border-l-4 border-l-amber-500">
                      <span className="text-xs font-medium text-slate-500 uppercase">Recommended Waivers</span>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {ws.decisionEngineOutput.recommendedWaivers.length > 0 ? (
                          ws.decisionEngineOutput.recommendedWaivers.map((w, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                              {w}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">None identified</span>
                        )}
                      </div>
                    </Card>

                    {/* Triggers / Flags */}
                    <div className="p-3 rounded-lg border">
                      <span className="text-xs font-medium text-slate-500 uppercase">Trigger Flags</span>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {ws.decisionEngineOutput.flags.length > 0 ? (
                          ws.decisionEngineOutput.flags.map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-red-100 text-red-800">
                              {f}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-green-600">No flags</span>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-500 uppercase text-xs">Unlawful Presence</span>
                        <div className="mt-1 space-y-0.5 text-slate-700">
                          <div>Overstayed: {ws.unlawfulPresence.overstayed ? "Yes" : ws.unlawfulPresence.overstayed === false ? "No" : "—"}</div>
                          <div>Duration: {ws.unlawfulPresence.duration || "—"}</div>
                          <div>Departed after: {ws.unlawfulPresence.departed ? "Yes" : ws.unlawfulPresence.departed === false ? "No" : "—"}</div>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-500 uppercase text-xs">Removal History</span>
                        <div className="mt-1 space-y-0.5 text-slate-700">
                          <div>Removed: {ws.removalHistory.removed ? "Yes" : ws.removalHistory.removed === false ? "No" : "—"}</div>
                          <div>Active Order: {ws.removalHistory.activeOrder ? "Yes" : ws.removalHistory.activeOrder === false ? "No" : "—"}</div>
                          <div>Expedited: {ws.removalHistory.expedited ? "Yes" : ws.removalHistory.expedited === false ? "No" : "—"}</div>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-500 uppercase text-xs">Fraud Indicators</span>
                        <div className="mt-1 space-y-0.5 text-slate-700">
                          <div>False Statements: {ws.fraudIndicators.statements ? "Yes" : ws.fraudIndicators.statements === false ? "No" : "—"}</div>
                          <div>False Documents: {ws.fraudIndicators.documents ? "Yes" : ws.fraudIndicators.documents === false ? "No" : "—"}</div>
                          <div>False Identity: {ws.fraudIndicators.identity ? "Yes" : ws.fraudIndicators.identity === false ? "No" : "—"}</div>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-500 uppercase text-xs">Criminal Indicators</span>
                        <div className="mt-1 space-y-0.5 text-slate-700">
                          <div>Arrests: {ws.criminalIndicators.arrests ? "Yes" : ws.criminalIndicators.arrests === false ? "No" : "—"}</div>
                          <div>Convictions: {ws.criminalIndicators.convictions ? "Yes" : ws.criminalIndicators.convictions === false ? "No" : "—"}</div>
                          {ws.criminalIndicators.offenses.length > 0 && (
                            <div>Offenses: {ws.criminalIndicators.offenses.join(", ")}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hardship */}
                    <div className="p-3 rounded-lg border">
                      <span className="text-xs font-medium text-slate-500 uppercase">Hardship Factors</span>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {ws.hardshipFactors.relatives.map((r, i) => (
                          <Badge key={`r-${i}`} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            {r}
                          </Badge>
                        ))}
                        {ws.hardshipFactors.types.map((h, i) => (
                          <Badge key={`h-${i}`} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                            {h}
                          </Badge>
                        ))}
                        {ws.hardshipFactors.relatives.length === 0 && ws.hardshipFactors.types.length === 0 && (
                          <span className="text-xs text-muted-foreground">None provided</span>
                        )}
                      </div>
                    </div>

                    {/* Guidance */}
                    {ws.decisionEngineOutput.nextStepGuidance.length > 0 && (
                      <div className="p-3 rounded-lg border">
                        <span className="text-xs font-medium text-slate-500 uppercase">Next Step Guidance</span>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
                          {ws.decisionEngineOutput.nextStepGuidance.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
