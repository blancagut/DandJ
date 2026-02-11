"use client"

import { useEffect, useState } from "react"

// ⚠️ CRITICAL: This error boundary must NOT import any heavy components
// (Button, Card, icons, etc.) because if the error was caused by a
// chunk-loading failure (common on mobile with slow connections),
// importing those components here would ALSO fail, causing a cascade
// to global-error or a blank white screen.
// All styling is inline to guarantee this page always renders.

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    console.error("[Diaz & Johnson] Client error caught by boundary:", error)

    // Try to report error to our API for remote debugging
    try {
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "ERROR_REPORT",
          lastName: "AUTO",
          email: "error@auto.report",
          phone: "",
          caseType: "error-report",
          message: `[Auto Error Report] ${error.message}\n\nDigest: ${error.digest || "none"}\nStack: ${error.stack?.slice(0, 500) || "none"}\nURL: ${typeof window !== "undefined" ? window.location.href : "unknown"}\nUA: ${typeof navigator !== "undefined" ? navigator.userAgent : "unknown"}`,
          language: "en",
        }),
      }).catch(() => { /* silent */ })
    } catch { /* silent */ }
  }, [error])

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: "32rem", width: "100%", background: "white", borderRadius: "0.75rem", padding: "2rem", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
          Something went wrong
        </h2>
        <p style={{ color: "#475569", marginBottom: "0.5rem" }}>
          We encountered an unexpected error. Please try again.
        </p>
        <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
          Encontramos un error inesperado. Por favor intente de nuevo.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
          <button
            onClick={() => { reset() }}
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

        {/* Diagnostic info — helps remote debugging */}
        <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "1rem", paddingTop: "1rem" }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
          >
            {showDetails ? "Hide details / Ocultar" : "Show error details / Ver detalles"}
          </button>
          {showDetails && (
            <div style={{ marginTop: "0.5rem", padding: "0.75rem", backgroundColor: "#fef2f2", borderRadius: "0.5rem", textAlign: "left", fontSize: "0.7rem", color: "#991b1b", wordBreak: "break-word", maxHeight: "200px", overflow: "auto" }}>
              <p><strong>Error:</strong> {error.message}</p>
              {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
              {error.stack && <p style={{ marginTop: "0.25rem", whiteSpace: "pre-wrap" }}>{error.stack.slice(0, 800)}</p>}
            </div>
          )}
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem" }}>
            Need help? Call <a href="tel:+13057280029" style={{ color: "#2563eb" }}>(305) 728-0029</a>
          </p>
        </div>
      </div>
    </div>
  )
}
