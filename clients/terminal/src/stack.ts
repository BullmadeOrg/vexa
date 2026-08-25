import "server-only";
import { StackServerApp } from "@stackframe/stack";

const appUrl = (
  process.env.NEXT_PUBLIC_TERMINAL_URL ||
  process.env.TERMINAL_URL ||
  "http://localhost:3001"
).replace(/\/$/, "");

// Next evaluates route modules while building. Deterministic non-secret placeholders let a clean
// checkout compile without Bullmade credentials; real deployments still inject all three values
// at build/runtime, and AuthGate only exposes Stack login when the public pair is configured.
const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID || "00000000-0000-4000-8000-000000000000";
const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || "pck_vexa_build_placeholder";
const secretServerKey = process.env.STACK_SECRET_SERVER_KEY || "ssk_vexa_build_placeholder";

/**
 * Bullmade identity provider. The SDK reads the project id, publishable key,
 * and server key from the standard Stack Auth environment variables.
 */
export const stackServerApp = new StackServerApp({
  projectId,
  publishableClientKey,
  secretServerKey,
  tokenStore: "nextjs-cookie",
  urls: {
    handler: `${appUrl}/handler`,
    home: `${appUrl}/`,
    afterSignIn: `${appUrl}/api/auth/stack?return_to=%2F`,
    afterSignUp: `${appUrl}/api/auth/stack?return_to=%2F`,
    afterSignOut: `${appUrl}/`,
  },
});
