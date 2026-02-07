"use client"

import { useState } from "react"
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useWorkScreeningTranslation } from "@/lib/work-screening-i18n"
import { WaiverLanguageSelector } from "@/components/waiver-language-selector"
import { demoWorkScreeningCases } from "@/components/work-screening-wizard"

const eligibilityStyles: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  likely_eligible: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
  possibly_eligible: { bg: "bg-amber-100", text: "text-amber-800", icon: AlertTriangle },
  higher_risk: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
}

export function WorkScreeningPanel() {
  const { t, ready } = useWorkScreeningTranslation()
  const [expandedCase, setExpandedCase] = useState<number | null>(null)
  const cases = demoWorkScreeningCases

  if (!ready) {
    return <div className="p-4 text-slate-400 animate-pulse">Loading…</div>
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold">{t("admin.panelTitle")}</h2>
          <Badge variant="secondary" className="text-xs">{cases.length}</Badge>
        </div>
        <WaiverLanguageSelector />
      </div>

      {cases.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">{t("admin.noCases")}</div>
      ) : (
        <div className="divide-y">
          {cases.map((c, idx) => {
            const ws = c.workScreening
            const isExpanded = expandedCase === idx
            const style = eligibilityStyles[ws.eligibilityLevel] || eligibilityStyles.likely_eligible
            const EligIcon = style.icon

            return (
              <div key={idx} className="p-4">
                <button
                  onClick={() => setExpandedCase(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-mono text-slate-500">{t("admin.caseNumber")} #{idx + 1}</span>
                    <Badge className={cn("text-xs", style.bg, style.text)}>
                      <EligIcon className="w-3 h-3 mr-1" />
                      {t(`results.${ws.eligibilityLevel === "likely_eligible" ? "likelyEligible" : ws.eligibilityLevel === "possibly_eligible" ? "possiblyEligible" : "higherRisk"}`)}
                    </Badge>
                    {ws.riskFlags.length > 0 && (
                      <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                        <AlertCircle className="w-3 h-3 mr-1" /> {ws.riskFlags.length}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">{new Date(ws.timestamp).toLocaleDateString()}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500 font-medium">{t("admin.goal")}:</span>
                      <span className="ml-2 text-slate-900">{ws.goalType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">{t("admin.jobOffer")}:</span>
                      <span className="ml-2 text-slate-900">{ws.jobOfferStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">{t("admin.workCategory")}:</span>
                      <span className="ml-2 text-slate-900">{ws.workCategory}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">{t("admin.education")}:</span>
                      <span className="ml-2 text-slate-900">{ws.educationLevel}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">{t("admin.experience")}:</span>
                      <span className="ml-2 text-slate-900">{ws.yearsExperience} | {ws.specializedExperience ? "Specialized" : "General"}</span>
                    </div>

                    {/* Visa Paths */}
                    <div className="md:col-span-2">
                      <span className="text-slate-500 font-medium">{t("admin.visaPaths")}:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ws.recommendedVisaPaths.map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs bg-indigo-100 text-indigo-800">
                            {t(`results.paths.${p}`)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Risk Flags */}
                    <div className="md:col-span-2">
                      <span className="text-slate-500 font-medium">{t("admin.riskFlags")}:</span>
                      {ws.riskFlags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ws.riskFlags.map((f) => (
                            <Badge key={f} variant="outline" className="text-xs text-red-700 border-red-200 bg-red-50">
                              {t(`results.flags.${f}`)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="ml-2 text-green-600 text-xs">{t("admin.noRisks")}</span>
                      )}
                    </div>

                    {/* Next Step */}
                    <div className="md:col-span-2">
                      <span className="text-slate-500 font-medium">{t("admin.nextStep")}:</span>
                      <span className="ml-2 text-slate-900">{t(`results.${ws.nextStep}`)}</span>
                    </div>
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
