import type { UserRole } from "./types";

const TOKEN_KEY = "careflow_access_token";

interface TokenPayload {
  sub: string;
  hospital_id: number;
  role: UserRole;
  exp?: number;
}

function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);

    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
}

export function getTokenPayload(): TokenPayload | null {
  const token = getToken();

  if (!token) {
    return null;
  }

  const payload = decodeToken(token);

  if (!payload) {
    removeToken();
    return null;
  }

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    removeToken();
    return null;
  }

  return payload;
}

export function getCurrentRole(): UserRole | null {
  return getTokenPayload()?.role ?? null;
}

export function isAuthenticated(): boolean {
  return getTokenPayload() !== null;
}
