import { stringify } from "querystring";

const API_BASE = "http://localhost:8000/api";


export async function initCSRF() {
  await fetch("http://localhost:8000/api/auth/csrf/", {
    credentials: "include",
  });
}


export async function apiFetch<T>(endpoint: string, options: RequestInit = {}) {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
  // console.log("CSRF Token:", csrfToken);
  console.log("API Fetching :", endpoint);
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      ...options.headers,
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

