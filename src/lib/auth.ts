// Simple demo authentication
export const DEMO_CREDENTIALS = {
  username: "admin",
  password: "admin",
};

export function checkAuth(username: string, password: string): boolean {
  return username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password;
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() === "demo_admin_token";
}
