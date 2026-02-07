"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  X, ShieldAlert, AlertTriangle, FileText, Heart, Gavel,
  Clock, Brain, CheckCircle2,
} from "lucide-react"
import type { WaiverScreeningRecord } from "@/lib/dashboard/waiver-types"
import { calculateLOS } from "@/lib/dashboard/waiver-data"

interface CaseDrillDownProps {
  record: WaiverScreeningRecord
  onClose: () => void
}

const riskBadge = (level: string) => {
  if (level === "High") return "bg-red-100 text-red-800 border-red-200"
  if (level === "Moderate") return "bg-amber-100 text-amber-800 border-amber-200"
  return "bg-green-100 text-green-800 border-green-200"
}

export function CaseDrillDown({ record, onClose }: CaseDrillDownProps) {
  const out = record.waiverScreening.decisionEngineOutput
  const los = calculateLOS(record)
  const ws = record.waiverScreening

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Client Waiver Intelligence</h2>
            <p className="text-xs text-slate-500">{record.id} — {record.clientName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-5 space-y-6">
          {/* Screening Summary */}
          <Section title="Screening Summary" icon={<FileText className="w-4 h-4 text-blue-600" />}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Country" value={record.clientCountry} />
              <InfoRow label="Location" value={ws.locationContext === "inside" ? "Inside U.S." : "Outside U.S."} />
              <InfoRow label="Context" value={ws.contextType} />
              <InfoRow label="Date" value={new Date(record.consultationTimestamp).toLocaleDateString()} />
              <InfoRow label="LOS Score" value={`${los}/100`} />
              <InfoRow label="Type" value={record.consultationType} />
            </div>
          </Section>

          {/* Risk & Probability */}
          <Section title="Risk Assessment" icon={<ShieldAlert className="w-4 h-4 text-red-600" />}>
            <div className="flex gap-3 flex-wrap">
              <Badge className={`border ${riskBadge(out.riskLevel)}`}>Risk: {out.riskLevel}</Badge>
              <Badge variant="outline">Probability: {out.probabilityLevel}</Badge>
              {record.priorityReview && (
                <Badge className="bg-red-600 text-white">Priority Review</Badge>
              )}
            </div>
          </Section>

          {/* Recommended Waivers */}
          <Section title="Recommended Waivers" icon={<Brain className="w-4 h-4 text-purple-600" />}>
            <div className="flex flex-wrap gap-2">
              {out.recommendedWaivers.map((w) => (
                <Badge key={w} variant="outline" className="text-sm px-3 py-1 bg-purple-50 border-purple-200 text-purple-800">{w}</Badge>
              ))}
            </div>
          </Section>

          {/* Inadmissibility Flags */}
          {out.flags.length > 0 && (
            <Section title="Triggered Inadmissibility Grounds" icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}>
              <div className="space-y-1.5">
                {out.flags.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {f}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Hardship Indicators */}
          <Section title="Hardship Indicators" icon={<Heart className="w-4 h-4 text-pink-600" />}>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-500 text-xs block mb-1">Qualifying Relatives</span>
                {ws.hardshipFactors.relatives.length > 0 ? (
                  ws.hardshipFactors.relatives.map((r) => (
                    <Badge key={r} variant="outline" className="mr-1 text-xs">{r}</Badge>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs">None reported</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 text-xs block mb-1">Hardship Types</span>
                {ws.hardshipFactors.types.length > 0 ? (
                  ws.hardshipFactors.types.map((t) => (
                    <Badge key={t} variant="outline" className="mr-1 text-xs">{t}</Badge>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs">None reported</span>
                )}
              </div>
            </div>
          </Section>

          {/* Criminal Indicators */}
          {ws.criminalIndicators.arrests && (
            <Section title="Criminal History" icon={<Gavel className="w-4 h-4 text-slate-600" />}>
              <div className="text-sm space-y-1">
                <InfoRow label="Arrests" value={ws.criminalIndicators.arrests ? "Yes" : "No"} />
                <InfoRow label="Convictions" value={ws.criminalIndicators.convictions ? "Yes" : "No"} />
                <div>
                  <span className="text-slate-500 text-xs">Offense categories: </span>
                  {ws.criminalIndicators.offenses.map((o) => (
                    <Badge key={o} variant="outline" className="mr-1 text-xs">{o}</Badge>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* AI Guidance */}
          {out.nextStepGuidance.length > 0 && (
            <Section title="AI Strategy Recommendation" icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {out.nextStepGuidance.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </Section>
          )}

          {/* Timeline */}
          <Section title="Timeline" icon={<Clock className="w-4 h-4 text-blue-600" />}>
            <div className="space-y-2 text-sm">
              <TimelineItem label="Screening Started" date={record.intakeStartedAt} />
              <TimelineItem label="Screening Completed" date={record.intakeCompletedAt} />
              <TimelineItem label="Consultation Timestamp" date={record.consultationTimestamp} />
            </div>
          </Section>

          {/* Disclaimer */}
          <div className="bg-slate-100 rounded-lg p-3 text-xs text-slate-500 italic">
            This analysis is generated by an automated screening tool and does not constitute legal advice.
            All case assessments must be reviewed by a licensed attorney before any action is taken.
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <span className="text-slate-500 text-xs">{label}</span>
      <div className="font-medium text-slate-800 text-sm">{value ?? "—"}</div>
    </div>
  )
}

function TimelineItem({ label, date }: { label: string; date?: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
      <div className="flex-1">
        <span className="text-slate-600">{label}</span>
      </div>
      <span className="text-xs text-slate-400">
        {date ? new Date(date).toLocaleString() : "—"}
      </span>
    </div>
  )
}
