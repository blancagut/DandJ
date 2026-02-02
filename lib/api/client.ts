export type ApiOk<T extends object = object> = {
  ok: true
} & T

export type ApiError = {
  ok: false
  error: {
    code: string
    message: string
    fieldErrors?: Record<string, string[]>
  }
}

export type ApiResponse<T extends object = object> = ApiOk<T> | ApiError

export async function postJson<TBody extends object, TData extends object>(
  url: string,
  body: TBody,
  init?: Omit<RequestInit, "method" | "body" | "headers">,
): Promise<ApiResponse<TData>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      ...init,
    })

    const json = (await res.json().catch(() => null)) as ApiResponse<TData> | null

    if (!json) {
      return {
        ok: false,
        error: {
          code: "INVALID_RESPONSE",
          message: "Unable to submit. Please try again.",
        },
      }
    }

    if (!res.ok && json.ok === true) {
      return {
        ok: false,
        error: {
          code: "HTTP_ERROR",
          message: "Unable to submit. Please try again.",
        },
      }
    }

    return json
  } catch {
    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Unable to submit. Please check your connection and try again.",
      },
    }
  }
}
