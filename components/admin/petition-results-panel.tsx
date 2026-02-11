"use client"

import { useState, useEffect, useCallback } from "react"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  ShieldAlert,
  Siren,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { usePetitionTranslation } from "@/lib/petition-i18n"
import { WaiverLanguageSelector } from "@/components/waiver-language-selector"
import {
  type PetitionSavedData,
  type CasePriority,
} from "@/lib/petition-types"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// Helper: capitalize first letter for translation key lookup
const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// Priority badge colors
const priorityStyles: Record<CasePriority, string> = {
  high: "bg-red-100 text-red-800 border-red-300",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-green-100 text-green-800 border-green-300",
}

const priorityIcons: Record<CasePriority, React.ReactNode> = {
  high: <Siren className="w-4 h-4 animate-pulse" />,
  moderate: <AlertTriangle className="w-4 h-4" />,
  low: <CheckCircle2 className="w-4 h-4" />,
}

export function PetitionResultsPanel() {
  const { t, ready } = usePetitionTranslation()
  const [expandedCase, setExpandedCase] = useState<number | null>(null)
  const [cases, setCases] = useState<(PetitionSavedData & { contactName?: string; contactEmail?: string; contactPhone?: string })[]>([])  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCases = useCallback(async () => {
    try {
      setError(null)
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - No hay tipos generados de Supabase
      const { data, error: queryError } = await supabase
        .from("petition_screenings")
        .select("id, data, status, contact_name, contact_email, contact_phone, created_at")
        .order("created_at", { ascending: false })

      if (queryError) {
        console.error("Query error:", queryError)
        setError("Failed to load petition results.")
        return
      }

      const parsed = (data || []).map((row: { data: PetitionSavedData; contact_name?: string; contact_email?: string; contact_phone?: string }) => ({
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

  const toggleCase = (idx: number) => {
    setExpandedCase(expandedCase === idx ? null : idx)
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Panel Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold">{t("admin.panelTitle")}</h2>
          <Badge variant="secondary" className="text-xs">{cases.length}</Badge>
        </div>
        <WaiverLanguageSelector />
      </div>

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          {t("admin.noCases")}
        </div>
      ) : (
        <div className="divide-y">
          {cases.map((caseData, idx) => {
            const s = caseData.petitionScreening
            const isExpanded = expandedCase === idx

            return (
              <div key={idx} className="transition-colors hover:bg-muted/30">
                {/* Collapsed Row */}
                <button
                  onClick={() => toggleCase(idx)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {t("admin.caseNumber")} #{idx + 1}
                      </span>
                      {caseData.contactName && <span className="text-sm font-semibold text-slate-900">{caseData.contactName}</span>}
                      {s.relationshipCategory && (
                        <Badge variant="outline" className="text-xs font-mono">
                          {s.relationshipCategory}
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className={cn("text-xs border", priorityStyles[s.casePriority])}
                      >
                        <span className="flex items-center gap-1">
                          {priorityIcons[s.casePriority]}
                          {t(`step9.priority${capFirst(s.casePriority)}`)}
                        </span>
                      </Badge>
                      {s.waiverFlag && (
                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          {t("admin.waiverNeeded")}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t("admin.beneficiary")}: {t("admin.from")} {s.beneficiaryInfo.countryOfBirth}, {t("admin.age")} {s.beneficiaryInfo.age} — {t("admin.submitted")} {new Date(s.timestamp).toLocaleDateString()}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Category */}
                      <Card className="p-3 border-l-4 border-l-emerald-500">
                        <span className="text-xs font-medium text-slate-500 uppercase">{t("admin.category")}</span>
                        <div className="mt-1 font-bold text-sm">
                          {s.relationshipCategory ? t(`categories.${s.relationshipCategory}`) : "—"}
                        </div>
                      </Card>

                      {/* Path */}
                      <Card className="p-3 border-l-4 border-l-blue-500">
                        <span className="text-xs font-medium text-slate-500 uppercase">{t("admin.path")}</span>
                        <div className="mt-1 font-bold text-sm">
                          {s.processingPath === "adjustment" ? t("step4.adjustment") : t("step4.consular")}
                        </div>
                      </Card>

                      {/* Priority */}
                      <Card className={cn("p-3 border-l-4", s.casePriority === "low" ? "border-l-green-500" : s.casePriority === "moderate" ? "border-l-yellow-500" : "border-l-red-500")}>
                        <span className="text-xs font-medium text-slate-500 uppercase">{t("admin.priority")}</span>
                        <div className={cn("mt-1 font-bold text-sm flex items-center gap-1", s.casePriority === "low" ? "text-green-700" : s.casePriority === "moderate" ? "text-yellow-700" : "text-red-700")}>
                          {priorityIcons[s.casePriority]}
                          {t(`step9.priority${capFirst(s.casePriority)}`)}
                        </div>
                      </Card>
                    </div>

                    {/* Petitioner Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-lg text-sm">
                        <span className="font-medium text-slate-500 uppercase text-xs">{t("admin.petitioner")}</span>
                        <div className="mt-1 space-y-0.5 text-slate-700">
                          <div>{t(`step1.${s.petitionerInfo.status}`)}, {s.petitionerInfo.yearsWithStatus}y</div>
                          <div>{t(`step2.${s.petitionerInfo.citizenshipMethod}`)}</div>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-sm">
                        <span className="font-medium text-slate-500 uppercase text-xs">{t("admin.beneficiary")}</span>
                        <div className="mt-1 space-y-0.5 text-slate-700">
                          <div>{s.beneficiaryInfo.countryOfBirth}, {t("admin.age")} {s.beneficiaryInfo.age}</div>
                          <div>{t("admin.in")} {s.beneficiaryInfo.countryOfResidence} ({s.beneficiaryInfo.location === "inside" ? t("step3.insideUS") : t("step3.outsideUS")})</div>
                        </div>
                      </div>
                    </div>

                    {/* Risks */}
                    <div className="p-3 rounded-lg border">
                      <span className="text-xs font-medium text-slate-500 uppercase">{t("admin.risks")}</span>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.inadmissibilityFlags.length > 0 ? (
                          s.inadmissibilityFlags.map((flag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-red-100 text-red-800">
                              {t(flag)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">{t("admin.noRisks")}</span>
                        )}
                      </div>
                    </div>

                    {/* Financial */}
                    <div className="p-3 rounded-lg border flex items-center gap-3">
                      {s.financialEligibility.meetsGuideline ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      )}
                      <div className="text-sm">
                        <span className="text-xs font-medium text-slate-500 uppercase">{t("admin.financial")}</span>
                        <div className="font-medium">
                          ${s.financialEligibility.income?.toLocaleString() || "—"} / {s.financialEligibility.dependents} dep. —{" "}
                          {s.financialEligibility.meetsGuideline ? t("admin.meetsGuideline") : t("admin.belowGuideline")}
                        </div>
                      </div>
                    </div>

                    {/* Marriage Flags */}
                    {s.marriageFraudIndicators.length > 0 && (
                      <div className="p-3 rounded-lg border">
                        <span className="text-xs font-medium text-slate-500 uppercase">{t("admin.marriageFlags")}</span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {s.marriageFraudIndicators.map((ind, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                              {t(ind)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strategy */}
                    <div className="p-3 rounded-lg border">
                      <span className="text-xs font-medium text-slate-500 uppercase">{t("admin.strategy")}</span>
                      <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-700">
                        {s.recommendedStrategy.map((str, i) => (
                          <li key={i}>{t(str)}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Timeline */}
                    {s.relationshipCategory && (
                      <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">{t("step9.estimatedTimeline")}:</span>
                        <span>{t(`timelines.${s.relationshipCategory}`)}</span>
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
