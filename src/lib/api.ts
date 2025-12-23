const API_BASE = "http://localhost:8000/api";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    // console.log(options);
    console.error("API ERROR:", res.status, text);
    throw new Error(text);
  }

  return res.json();
}

