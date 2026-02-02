"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { AdminLogin } from "./admin-login"
import { AdminDashboard } from "./admin-dashboard"

// Lista de emails permitidos (se puede dejar vacío para permitir cualquier usuario autenticado)
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || []

type AuthState = "loading" | "unauthenticated" | "authenticated" | "unauthorized" | "error"

export function AdminClient() {
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [user, setUser] = useState<User | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Verificar si el email es admin
  const isAdminEmail = useCallback((email: string | undefined): boolean => {
    if (!email) return false
    // Si no hay lista de admins, cualquier usuario autenticado es admin
    if (ADMIN_EMAILS.length === 0) return true
    return ADMIN_EMAILS.includes(email.toLowerCase())
  }, [])

  // Verificar autenticación al cargar
  useEffect(() => {
    let mounted = true

    async function checkAuth() {
      try {
        const supabase = getSupabaseBrowserClient()
        
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (!mounted) return

        if (error) {
          console.error("Auth check error:", error)
          setAuthState("unauthenticated")
          return
        }

        if (!user) {
          setAuthState("unauthenticated")
          return
        }

        // Verificar si es admin
        if (!isAdminEmail(user.email)) {
          setUser(user)
          setAuthState("unauthorized")
          return
        }

        setUser(user)
        setAuthState("authenticated")
      } catch (err) {
        if (!mounted) return
        console.error("Auth check failed:", err)
        setErrorMessage("No se pudo conectar con el servidor. Intenta de nuevo más tarde.")
        setAuthState("error")
      }
    }

    checkAuth()

    // Escuchar cambios de autenticación
    let subscription: { unsubscribe: () => void } | null = null
    
    try {
      const supabase = getSupabaseBrowserClient()
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return
        
        if (!session?.user) {
          setUser(null)
          setAuthState("unauthenticated")
          return
        }

        if (!isAdminEmail(session.user.email)) {
          setUser(session.user)
          setAuthState("unauthorized")
          return
        }

        setUser(session.user)
        setAuthState("authenticated")
      })
      subscription = data.subscription
    } catch (err) {
      console.error("Auth subscription failed:", err)
    }

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [isAdminEmail])

  // Función para cerrar sesión
  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      setUser(null)
      setAuthState("unauthenticated")
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  // Función para refrescar después de login exitoso
  const handleLoginSuccess = (loggedUser: User) => {
    if (!isAdminEmail(loggedUser.email)) {
      setUser(loggedUser)
      setAuthState("unauthorized")
      return
    }
    setUser(loggedUser)
    setAuthState("authenticated")
  }

  // RENDER: Estado de carga
  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // RENDER: Error de conexión
  if (authState === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto p-6 text-center">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error de Conexión</h2>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // RENDER: Usuario no autorizado (autenticado pero no es admin)
  if (authState === "unauthorized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto p-6 text-center">
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-6">
            <h2 className="text-xl font-semibold text-amber-600 mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground mb-2">
              Has iniciado sesión como <strong>{user?.email}</strong>
            </p>
            <p className="text-muted-foreground mb-4">
              Esta cuenta no tiene permisos de administrador.
            </p>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  // RENDER: Formulario de login
  if (authState === "unauthenticated") {
    return <AdminLogin onSuccess={handleLoginSuccess} />
  }

  // RENDER: Dashboard (usuario autenticado y es admin)
  return <AdminDashboard user={user!} onSignOut={handleSignOut} />
}
