const CUSTOMER_TOKEN_KEY = "nuru_customer_token";
const CUSTOMER_PROFILE_KEY = "nuru_customer_profile";
export const CUSTOMER_AUTH_UPDATED_EVENT = "nuru:customer-auth-updated";

export type CustomerProfile = {
  id: string;
  email: string;
  name?: string;
  role: string;
};

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function setCustomerAuth(token: string, user: CustomerProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(CUSTOMER_AUTH_UPDATED_EVENT));
}

export function getCustomerProfile(): CustomerProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CUSTOMER_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerProfile;
  } catch {
    return null;
  }
}

export function clearCustomerAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_PROFILE_KEY);
  window.dispatchEvent(new Event(CUSTOMER_AUTH_UPDATED_EVENT));
}

