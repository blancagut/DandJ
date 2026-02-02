import { NextResponse } from "next/server"
import { z } from "zod"

export type ApiOk<T extends object = object> = {
  ok: true
} & T

export type ApiError = {
  ok: false
  error: {
    code: string
    message: string
    fieldErrors?: Record<string, string[] | undefined>
  }
}

export function jsonOk<T extends object>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, ...data } satisfies ApiOk<T>, { status: 200, ...init })
}

export function jsonError(
  code: string,
  message: string,
  fieldErrors?: Record<string, string[] | undefined>,
  status = 400,
) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(fieldErrors ? { fieldErrors } : {}),
      },
    } satisfies ApiError,
    { status },
  )
}

export function zodToFieldErrors(err: z.ZodError) {
  const flattened = err.flatten()
  return flattened.fieldErrors
}

function appendOrSet(obj: Record<string, unknown>, key: string, value: unknown) {
  const current = obj[key]
  if (current === undefined) {
    obj[key] = value
    return
  }
  if (Array.isArray(current)) {
    obj[key] = [...current, value]
    return
  }
  obj[key] = [current, value]
}

export async function parseRequestBody(req: Request): Promise<Record<string, unknown>> {
  const contentType = req.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    const json = (await req.json().catch(() => null)) as unknown
    if (json && typeof json === "object" && !Array.isArray(json)) return json as Record<string, unknown>
    return {}
  }

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const fd = await req.formData()
    const out: Record<string, unknown> = {}

    for (const [key, value] of fd.entries()) {
      // value can be string or File
      appendOrSet(out, key, value)
    }

    return out
  }

  // Fallback: try JSON, otherwise empty
  const maybeJson = (await req.json().catch(() => null)) as unknown
  if (maybeJson && typeof maybeJson === "object" && !Array.isArray(maybeJson)) return maybeJson as Record<string, unknown>
  return {}
}

export function isHoneypotTripped(data: Record<string, unknown>, fieldName = "website") {
  const value = data[fieldName]

  if (typeof value === "string") return value.trim().length > 0
  if (Array.isArray(value)) return value.some((v) => typeof v === "string" && v.trim().length > 0)

  return false
}
