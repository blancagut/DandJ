"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isAdminUser } from "@/lib/server/admin-auth"
import {
  createWorkItem,
  deleteWorkItem,
  listWorkItems,
  updateWorkItem,
  type WorkItem,
  type WorkItemStatus,
} from "@/lib/server/work-items"

export type { WorkItem, WorkItemStatus }

async function requireAdmin() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")
  if (!isAdminUser(user)) throw new Error("Not authorized")

  return { user }
}

export async function listWorkItemsAction(): Promise<WorkItem[]> {
  await requireAdmin()
  return listWorkItems()
}

export async function createWorkItemAction(input: { title: string; notes?: string }): Promise<WorkItem> {
  await requireAdmin()
  return createWorkItem({ title: input.title, notes: input.notes ?? null })
}

export async function updateWorkItemAction(input: {
  id: string
  title?: string
  notes?: string | null
  status?: WorkItemStatus
}): Promise<WorkItem> {
  await requireAdmin()
  return updateWorkItem(input)
}

export async function deleteWorkItemAction(id: string): Promise<void> {
  await requireAdmin()
  await deleteWorkItem(id)
}
