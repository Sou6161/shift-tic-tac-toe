// Empty in dev (Vite proxies /api and /socket.io to :4000); the Render URL in production.
export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const SOCKET_URL = API_URL || window.location.origin;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // No JSON body means the reply didn't come from our backend: dev server off, or Render waking up.
    const fallback =
      res.status >= 500
        ? import.meta.env.DEV
          ? "The backend isn't running. Start it with: cd server && npm run dev"
          : "The server is waking up. Try again in a few seconds."
        : "Something went wrong.";
    throw new ApiError(data.error || fallback, res.status);
  }
  return data;
}
