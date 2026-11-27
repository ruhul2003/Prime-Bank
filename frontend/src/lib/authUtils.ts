export interface JwtPayload {
  id?: string;
  role?: string;
  email?: string;
  type?: string;
  iat?: number;
  exp?: number;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  colorClass: string;
}

/**
 * Safely decodes the payload of a JWT without external dependencies.
 */
export function decodeJwtPayload(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Checks whether a JWT is missing, malformed, or past its expiration timestamp.
 */
export function isTokenExpired(
  token: string | null | undefined,
  skewSeconds: number = 30
): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds + skewSeconds;
}

/**
 * Resolves the default dashboard route for a given PrimeBank user role.
 */
export function getDashboardPathForRole(role?: string | null): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "staff") return "/dashboard/staff";
  return "/dashboard/customer";
}

/**
 * Evaluates password complexity on a 0-4 scale for registration and password updates.
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "Enter a password", colorClass: "bg-slate-200" };
  }

  let points = 0;
  if (password.length >= 6) points += 1;
  if (password.length >= 10) points += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) points += 1;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) points += 1;

  const score = Math.min(4, Math.max(1, points)) as 1 | 2 | 3 | 4;
  const map: Record<1 | 2 | 3 | 4, { label: string; colorClass: string }> = {
    1: { label: "Weak", colorClass: "bg-rose-500" },
    2: { label: "Fair", colorClass: "bg-amber-500" },
    3: { label: "Good", colorClass: "bg-sky-500" },
    4: { label: "Strong", colorClass: "bg-emerald-500" },
  };

  return { score, ...map[score] };
}
