import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { signInWithPasswordAction } from "@/app/login/actions"

export const dynamic = "force-dynamic"

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function LoginPage({ searchParams }: Props) {
  const params = searchParams ?? {}
  const error = typeof params.error === "string" ? params.error : undefined
  const redirectTo = typeof params.redirect === "string" ? params.redirect : "/admin"

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Sign in to manage internal work tracking.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {decodeURIComponent(error)}
            </div>
          ) : null}

          <form action={signInWithPasswordAction} className="space-y-4">
            <input type="hidden" name="redirect" value={redirectTo} />

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Don&apos;t have credentials yet? Create an admin user in Supabase Authentication.
          </p>

          <div className="mt-4 text-sm">
            <Link className="text-primary hover:underline" href="/">
              Back to website
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
