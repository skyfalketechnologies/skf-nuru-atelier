const TOKEN_KEY = "nuru_admin_token";
const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "STAFF"]);

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function isAdminRole(role: string | undefined | null): boolean {
  if (!role) return false;
  return ADMIN_ROLES.has(role);
}

