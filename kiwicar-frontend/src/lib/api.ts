const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error('Missing VITE_API_BASE_URL environment variable.')
}

function buildUrl(path: string): string {
  try {
    return new URL(path, apiBaseUrl).toString()
  } catch {
    throw new Error(`Invalid API base URL: ${apiBaseUrl}`)
  }
}

export async function apiGet<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: 'GET',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(`API request failed (${response.status}): ${message || response.statusText}`)
  }

  return (await response.json()) as T
}
