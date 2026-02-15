"use client"

import { useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type FormStatus = "idle" | "submitting" | "success" | "error"

export function ConsultForm() {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [mensaje, setMensaje] = useState("")
  
  const [status, setStatus] = useState<FormStatus>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  // Validación simple
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = nombre.trim().length >= 2 && 
                  emailRegex.test(email) && 
                  mensaje.trim().length >= 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid) {
      setErrorMsg("Por favor completa todos los campos correctamente.")
      return
    }

    setStatus("submitting")
    setErrorMsg("")

    try {
      const supabase = getSupabaseBrowserClient()

      // @ts-expect-error - No hay tipos generados de Supabase
      const { error } = await supabase
        .from("consult_requests")
        .insert({
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          telefono: telefono.trim() || null,
          mensaje: mensaje.trim(),
          status: "nuevo",
        })

      if (error) {
        console.error("Insert error:", error)
        setErrorMsg("Error al enviar. Intenta de nuevo.")
        setStatus("error")
        return
      }

      // Éxito
      setStatus("success")
      setNombre("")
      setEmail("")
      setTelefono("")
      setMensaje("")
    } catch (err) {
      console.error("Submit error:", err)
      setErrorMsg("Error de conexión. Intenta de nuevo.")
      setStatus("error")
    }
  }

  // Mostrar confirmación de éxito
  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto p-8">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">¡Solicitud Enviada!</h2>
          <p className="text-green-700 mb-4">
            Hemos recibido tu consulta. Un abogado se pondrá en contacto contigo pronto.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Enviar otra consulta
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="rounded-lg border bg-card shadow-sm p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Solicita una Consulta</h2>
          <p className="text-muted-foreground mt-1">
            Completa el formulario y te contactaremos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <label htmlFor="nombre" className="text-sm font-medium">
              Nombre completo <span className="text-destructive">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
              disabled={status === "submitting"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={status === "submitting"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <label htmlFor="telefono" className="text-sm font-medium">
              Teléfono <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={status === "submitting"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Mensaje */}
          <div className="space-y-2">
            <label htmlFor="mensaje" className="text-sm font-medium">
              ¿En qué podemos ayudarte? <span className="text-destructive">*</span>
            </label>
            <textarea
              id="mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Describe brevemente tu situación o consulta..."
              required
              rows={4}
              disabled={status === "submitting"}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 resize-none"
            />
            <p className="text-xs text-muted-foreground">Mínimo 10 caracteres</p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3">
              <p className="text-sm text-destructive">{errorMsg}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "submitting" || !isValid}
            className="w-full h-11 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "submitting" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Enviando...
              </span>
            ) : (
              "Enviar Consulta"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Tu información es confidencial y está protegida.
        </p>
      </div>
    </div>
  )
}
