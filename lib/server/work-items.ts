import { createClient } from "@supabase/supabase-js"

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  return createClient(url, serviceKey)
}

export type WorkItemStatus = "todo" | "in_progress" | "done"

export type WorkItem = {
  id: string
  title: string
  status: WorkItemStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export async function listWorkItems(): Promise<WorkItem[]> {
  const supabase = getAdminSupabase()

  const { data, error } = await supabase
    .from("work_items")
    .select("id,title,status,notes,created_at,updated_at")
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Supabase work_items query error:", error)
    throw new Error(`Failed to load work items: ${error.message}`)
  }
  return (data ?? []) as WorkItem[]
}

export async function createWorkItem(input: { title: string; notes?: string | null }): Promise<WorkItem> {
  const supabase = getAdminSupabase()

  const { data, error } = await supabase
    .from("work_items")
    .insert({
      title: input.title,
      notes: input.notes ?? null,
      status: "todo" satisfies WorkItemStatus,
    })
    .select("id,title,status,notes,created_at,updated_at")
    .single()

  if (error) throw new Error(`Failed to create work item: ${error.message}`)
  return data as WorkItem
}

export async function updateWorkItem(input: {
  id: string
  title?: string
  notes?: string | null
  status?: WorkItemStatus
}): Promise<WorkItem> {
  const supabase = getAdminSupabase()

  const { data, error } = await supabase
    .from("work_items")
    .update({
      ...(input.title !== undefined ? { title: input.title } : null),
      ...(input.notes !== undefined ? { notes: input.notes } : null),
      ...(input.status !== undefined ? { status: input.status } : null),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select("id,title,status,notes,created_at,updated_at")
    .single()

  if (error) throw new Error(`Failed to update work item: ${error.message}`)
  return data as WorkItem
}

export async function deleteWorkItem(id: string): Promise<void> {
  const supabase = getAdminSupabase()
  const { error } = await supabase.from("work_items").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete work item: ${error.message}`)
}
