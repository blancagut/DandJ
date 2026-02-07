"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, Phone } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Diaz & Johnson] Client error caught by boundary:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-slate-600 mb-2">
          We encountered an unexpected error. Your form data has been saved locally and will be restored when you try again.
        </p>
        <p className="text-slate-600 mb-6">
          Encontramos un error inesperado. Sus datos se guardaron localmente y se restaurarán cuando lo intente nuevamente.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Button onClick={reset} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4" /> Try Again / Reintentar
          </Button>
          <Link href="/consult">
            <Button variant="outline" className="gap-2 w-full">
              <Home className="w-4 h-4" /> Back to Forms / Volver
            </Button>
          </Link>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
            <Phone className="w-3 h-3" />
            Need help? Call <a href="tel:+13054567890" className="text-blue-600 font-medium hover:underline">(305) 456-7890</a>
          </p>
        </div>
      </Card>
    </div>
  )
}
