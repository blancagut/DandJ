"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Diaz & Johnson] Global error:", error)
  }, [error])

  return (
    <html>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#f8fafc" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ maxWidth: "32rem", width: "100%", background: "white", borderRadius: "0.75rem", padding: "2rem", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#475569", marginBottom: "0.5rem" }}>
              We encountered an unexpected error. Your form data has been saved locally.
            </p>
            <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
              Encontramos un error inesperado. Sus datos se guardaron localmente.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{ padding: "0.5rem 1.5rem", background: "#2563eb", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}
              >
                Try Again / Reintentar
              </button>
              <a
                href="/consult"
                style={{ padding: "0.5rem 1.5rem", background: "white", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: "0.5rem", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}
              >
                Back to Forms / Volver
              </a>
            </div>
            <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "1.5rem", paddingTop: "1rem" }}>
              <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Need help? Call <a href="tel:+13054567890" style={{ color: "#2563eb" }}>(305) 456-7890</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
