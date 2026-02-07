"use client"

import { useLanguage } from "@/lib/language-context"
import { Globe } from "lucide-react"

/**
 * Compact EN | ES language toggle for the Waiver Wizard header.
 * Reads/writes via the existing LanguageProvider so the selection
 * is shared with the rest of the app and persisted to localStorage.
 */
export function WaiverLanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm shadow-sm">
      <Globe className="h-4 w-4 text-slate-400" />
      <button
        onClick={() => setLanguage("en")}
        className={
          language === "en"
            ? "rounded px-2 py-0.5 font-semibold bg-slate-900 text-white transition-colors"
            : "rounded px-2 py-0.5 font-medium text-slate-500 hover:text-slate-900 transition-colors"
        }
      >
        EN
      </button>
      <span className="text-slate-300">|</span>
      <button
        onClick={() => setLanguage("es")}
        className={
          language === "es"
            ? "rounded px-2 py-0.5 font-semibold bg-slate-900 text-white transition-colors"
            : "rounded px-2 py-0.5 font-medium text-slate-500 hover:text-slate-900 transition-colors"
        }
      >
        ES
      </button>
    </div>
  )
}
