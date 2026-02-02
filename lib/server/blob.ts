import { put } from "@vercel/blob"

function sanitizeFilename(name: string) {
  return name.replace(/[\\/\n\r\t\0]/g, "-").replace(/\s+/g, " ").trim()
}

export async function uploadLeadFile(params: {
  leadId: string
  file: File
}): Promise<{ url: string; pathname: string }> {
  const originalName = sanitizeFilename(params.file.name || "upload")
  const pathname = `${params.leadId}/${crypto.randomUUID()}-${originalName}`

  const bytes = await params.file.arrayBuffer()
  const body = Buffer.from(bytes)

  const uploaded = await put(pathname, body, {
    access: "public",
    contentType: params.file.type || "application/octet-stream",
    addRandomSuffix: false,
  })

  return { url: uploaded.url, pathname: uploaded.pathname }
}
