import type { NextConfig } from "next";
import path from "path";

/**
 * Terminal composition root.
 *
 * Same-origin fallback for `/b/` (per-bot VNC/CDP), targeting the deploy SSOT `VEXA_API_URL`.
 * During early scaffolding (no backend) the rewrite is simply omitted so `npm run dev` works
 * against the prototype with no env required.
 *
 * NOTE: `/ws` is intentionally NOT rewritten here — Next.js rewrites proxy HTTP only and do not
 * carry the WebSocket upgrade. The custom server (server.mjs) handles the `/ws` upgrade directly,
 * proxying it to the gateway with the server-side api_key. A rewrite here would shadow that path.
 */
const VEXA_API_URL = process.env.VEXA_API_URL;

function securityHeaders(scriptSources: string[]) {
  return [
    {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self' https://*.stack-auth.com",
        `script-src ${scriptSources.join(" ")}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "media-src 'self' blob:",
        "connect-src 'self' https://*.stack-auth.com wss:",
        "frame-src 'self' https://*.stack-auth.com",
        "worker-src 'self' blob:",
        "upgrade-insecure-requests",
      ].join("; "),
    },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
  ];
}

const defaultSecurityHeaders = securityHeaders(["'self'", "'unsafe-inline'"]);

// Stack Auth's built-in handler executes its own generated layout scripts with indirect eval.
// Keep that SDK requirement confined to the handler pages instead of weakening the terminal.
const stackHandlerSecurityHeaders = securityHeaders(["'self'", "'unsafe-inline'", "'unsafe-eval'"]);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(process.env.BUILD_STANDALONE === "1" ? { output: "standalone" } : {}),
  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: { "@stripe/stripe-js": "@stripe/stripe-js/pure" },
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@stripe/stripe-js$": "@stripe/stripe-js/pure",
    };
    return config;
  },
  async headers() {
    return [
      { source: "/:path*", headers: defaultSecurityHeaders },
      { source: "/handler/:path*", headers: stackHandlerSecurityHeaders },
    ];
  },
  async rewrites() {
    return VEXA_API_URL
      ? [
          { source: "/b/:path*", destination: `${VEXA_API_URL}/b/:path*` },
        ]
      : [];
  },
};

export default nextConfig;
