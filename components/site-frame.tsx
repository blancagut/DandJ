import type React from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ValeriaChat } from "@/components/valeria-chat"

export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-20">{children}</div>
      <Footer />
      <ValeriaChat />
    </main>
  )
}
