"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { H2BIntakeWizard } from "@/components/h2b-intake-wizard"

export default function H2BScreeningPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="pt-6 px-4 md:px-8">
        <Link href="/">
          <Button variant="outline" size="sm" className="bg-white">
            <ArrowLeft className="h-4 w-4 mr-2" /> Regresar
          </Button>
        </Link>
      </div>
      <H2BIntakeWizard />
    </div>
  )
}
