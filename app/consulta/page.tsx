"use client"

import { useEffect } from "react"
import { ConsultationForm } from "@/components/consultation-form"
import { ValeriaChat } from "@/components/valeria-chat"
import { useLanguage } from "@/lib/language-context"

export default function ConsultaPage() {
  const { setLanguage } = useLanguage()

  // Force Spanish language on this page
  useEffect(() => {
    setLanguage("es")
  }, [setLanguage])

  return (
    <>
      <ConsultationForm />
      <ValeriaChat />
    </>
  )
}
