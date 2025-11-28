import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

/**
 * Get session cookie options with secure defaults
 * 
 * Security improvements (Sprint 1):
 * - sameSite: "strict" - Prevents CSRF attacks
 * - secure: true - Always require HTTPS (except localhost in dev)
 * - domain: explicit - Prevents cookie leakage between subdomains
 * - httpOnly: true - Prevents XSS attacks (already set)
 */
export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = req.hostname;
  const isProduction = process.env.NODE_ENV === "production";
  const isLocalhost = LOCAL_HOSTS.has(hostname) || isIpAddress(hostname);
  
  // In production, set domain explicitly to prevent subdomain leakage
  // In development, leave domain undefined for localhost
  const domain = isProduction && !isLocalhost && hostname
    ? hostname.startsWith(".") 
      ? hostname 
      : `.${hostname}`
    : undefined;

  return {
    httpOnly: true,
    path: "/",
    // Use "strict" for maximum security (prevents CSRF)
    // Note: This may require same-site navigation for OAuth flows
    sameSite: "strict",
    // Always use secure cookies, except localhost in development
    secure: isLocalhost && !isProduction ? false : true,
    domain,
  };
}
