export const dynamic = "force-static"

export default function AdminPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="rounded-lg border bg-card p-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">ADMIN OK</h1>
        <p className="mt-3 text-muted-foreground">Temporary static admin page. Auth, database, and middleware are disabled.</p>
      </div>
    </div>
  )
}
