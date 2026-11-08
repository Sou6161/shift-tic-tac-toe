// Base URL of the Node backend.
// - Production: VITE_API_URL, e.g. https://shift-server.onrender.com
// - Development: empty, so requests go to the Vite dev server, which proxies
//   /api and /socket.io to http://localhost:4000 (see vite.config.js).
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
  if (!res.ok) throw new ApiError(data.error || "Something went wrong.", res.status);
  return data;
}
