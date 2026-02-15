"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PenSquare, History } from "lucide-react"
import { EmailComposer } from "./email-composer"
import { EmailHistory } from "./email-history"

type View = "compose" | "history"

export function EmailTab() {
  const [view, setView] = useState<View>("compose")
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  const handleSent = () => {
    // When an email is sent, refresh history and switch to it
    setHistoryRefreshKey((k) => k + 1)
    setView("history")
  }

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center gap-2 border-b pb-3">
        <Button
          variant={view === "compose" ? "default" : "ghost"}
          size="sm"
          onClick={() => setView("compose")}
          className={view === "compose" ? "bg-[#0B1E3A] hover:bg-[#0B1E3A]/90" : ""}
        >
          <PenSquare className="h-4 w-4 mr-2" />
          Compose
        </Button>
        <Button
          variant={view === "history" ? "default" : "ghost"}
          size="sm"
          onClick={() => setView("history")}
          className={view === "history" ? "bg-[#0B1E3A] hover:bg-[#0B1E3A]/90" : ""}
        >
          <History className="h-4 w-4 mr-2" />
          Sent History
        </Button>
      </div>

      {/* Content */}
      {view === "compose" ? (
        <EmailComposer onSent={handleSent} />
      ) : (
        <EmailHistory refreshKey={historyRefreshKey} />
      )}
    </div>
  )
}
