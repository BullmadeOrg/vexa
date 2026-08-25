import "server-only";
import { StackServerApp } from "@stackframe/stack";

const appUrl = (
  process.env.NEXT_PUBLIC_TERMINAL_URL ||
  process.env.TERMINAL_URL ||
  "http://localhost:3001"
).replace(/\/$/, "");

/**
 * Bullmade identity provider. The SDK reads the project id, publishable key,
 * and server key from the standard Stack Auth environment variables.
 */
export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    handler: `${appUrl}/handler`,
    home: `${appUrl}/`,
    afterSignIn: `${appUrl}/api/auth/stack?return_to=%2F`,
    afterSignUp: `${appUrl}/api/auth/stack?return_to=%2F`,
    afterSignOut: `${appUrl}/`,
  },
});
