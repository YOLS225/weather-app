type ParamValue = string | number | boolean | readonly string[]

interface FetchOptions extends RequestInit {
  params?: Record<string, ParamValue>
}

function buildQueryString(params: Record<string, ParamValue>): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value as string[]) {
        parts.push(`${key}=${encodeURIComponent(v)}`)
      }
    } else {
      parts.push(`${key}=${encodeURIComponent(String(value))}`)
    }
  }
  return parts.join("&")
}

export async function apiFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options

  const fullUrl = params ? `${url}?${buildQueryString(params)}` : url

  const res = await fetch(fullUrl, init)

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText)
    throw new Error(`API ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}
