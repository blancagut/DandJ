"use server"

import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const redirectTo = String(formData.get("redirect") ?? "/admin")

  if (!email || !password) {
    redirect(`/login?error=missing_fields&redirect=${encodeURIComponent(redirectTo)}`)
  }

  let supabase

  try {
    supabase = await getSupabaseServerClient()
  } catch (e) {
    const message = e instanceof Error ? e.message : "Missing Supabase config"
    redirect(`/login?error=${encodeURIComponent(message)}&redirect=${encodeURIComponent(redirectTo)}`)
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&redirect=${encodeURIComponent(redirectTo)}`)
  }

  redirect(redirectTo)
}

export async function signOutAction() {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}
