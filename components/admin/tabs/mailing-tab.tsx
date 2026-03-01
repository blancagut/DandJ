"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PenSquare, History, LibraryBig } from "lucide-react"
import { EmailComposer } from "./email-composer"
import { EmailHistory } from "./email-history"
import { MailingTemplates } from "./mailing-templates"

type View = "campaign" | "templates" | "history"

export function MailingTab() {
  const [view, setView] = useState<View>("campaign")
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  const handleSent = () => {
    setHistoryRefreshKey((key) => key + 1)
    setView("history")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div>
          <h2 className="text-base font-semibold">Mailing Engine</h2>
          <p className="text-sm text-muted-foreground">Gestiona campañas, plantillas y envíos desde un solo lugar.</p>
        </div>
        <Badge variant="secondary">Admin</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={view === "campaign" ? "default" : "ghost"} size="sm" onClick={() => setView("campaign")}>
          <PenSquare className="h-4 w-4 mr-2" />
          Campaign Builder
        </Button>
        <Button variant={view === "templates" ? "default" : "ghost"} size="sm" onClick={() => setView("templates")}>
          <LibraryBig className="h-4 w-4 mr-2" />
          Templates
        </Button>
        <Button variant={view === "history" ? "default" : "ghost"} size="sm" onClick={() => setView("history")}>
          <History className="h-4 w-4 mr-2" />
          Sent History
        </Button>
      </div>

      {view === "campaign" && <EmailComposer onSent={handleSent} />}
      {view === "templates" && <MailingTemplates onUseTemplate={() => setView("campaign")} />}
      {view === "history" && <EmailHistory refreshKey={historyRefreshKey} />}
    </div>
  )
}
