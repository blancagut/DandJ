import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WorkItemsPanel } from "@/components/admin/work-items-panel"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isAdminUser } from "@/lib/server/admin-auth"
import { listWorkItems, type WorkItem } from "@/lib/server/work-items"
import { signOutAction } from "@/app/login/actions"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/admin")
  }

  if (!isAdminUser(user)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Not authorized</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Your account does not have access to the admin panel.</p>
            <form action={signOutAction}>
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  let items: WorkItem[] = []
  let loadError: string | null = null

  try {
    items = await listWorkItems()
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load work items"
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
          <p className="text-muted-foreground">Signed in as {user.email}</p>
          {process.env.ADMIN_EMAILS ? null : (
            <p className="text-xs text-muted-foreground mt-1">
              Tip: set ADMIN_EMAILS in env to restrict access (comma-separated).
            </p>
          )}
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>

      {loadError ? (
        <Card>
          <CardHeader>
            <CardTitle>Database not ready</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">The admin work tracking table isn&apos;t available yet. Run the migration and reload this page.</p>
            <p className="text-sm text-muted-foreground">Error: {loadError}</p>
            <div className="text-sm text-muted-foreground">
              Run <span className="font-mono">pnpm db:migrate</span> after configuring Supabase env vars.
            </div>
          </CardContent>
        </Card>
      ) : (
        <WorkItemsPanel initialItems={items} />
      )}
    </div>
  )
}
