import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  // Only protect /admin routes.
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return NextResponse.redirect(new URL("/login?error=missing_env", request.url))
  }

  const response = NextResponse.next({ request })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const rawAllowlist = process.env.ADMIN_EMAILS
  if (rawAllowlist && user.email) {
    const allowlist = new Set(
      rawAllowlist
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean),
    )

    if (allowlist.size > 0 && !allowlist.has(user.email.toLowerCase())) {
      return NextResponse.redirect(new URL("/login?error=not_authorized", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*"],
}
