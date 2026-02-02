import { AdminClient } from "@/components/admin/admin-client"

// IMPORTANTE: Esta página es estática para evitar errores de servidor en Vercel
// Toda la lógica de auth y database se ejecuta en el navegador (client-side)
export const dynamic = "force-static"

export default function AdminPage() {
  return <AdminClient />
}
