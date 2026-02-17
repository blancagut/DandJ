"use client"

import { ConsultationForm } from "@/components/consultation-form"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export default function GeneralConsultPage() {
  const { language } = useLanguage()
  const backLabel = language === "es" ? "Volver a Selección" : "Back to Selection"

  return (
    <div className="relative">
      <Link href="/consult">
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 z-50 md:top-8 md:left-8 bg-white/80 backdrop-blur"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> {backLabel}
        </Button>
      </Link>
      <ConsultationForm />
    </div>
  )
}
