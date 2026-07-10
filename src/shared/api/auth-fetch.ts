import { API_URL } from "@/shared/config";

function getToken(): string | null {
  const result = /access_token=([^;]+)/.exec(document.cookie);
  return result ? result[1] : null;
}

export async function authFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${API_URL}${path}`, { ...options, headers });
}
