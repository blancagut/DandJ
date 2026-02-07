"use client"

import { WaiverWizard } from "@/components/waiver-wizard"
import { ValeriaChat } from "@/components/valeria-chat"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export default function WaiverScreeningPage() {
  const { language } = useLanguage()
  const backLabel = language === "es" ? "Volver a Selección" : "Back to Selection"

  return (
    <div className="relative">
      <div className="bg-slate-50 min-h-screen pt-4">
        <Link href="/consult">
          <Button variant="outline" size="sm" className="ml-4 md:ml-8 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> {backLabel}
          </Button>
        </Link>
        <WaiverWizard />
      </div>
      <ValeriaChat />
    </div>
  )
}
