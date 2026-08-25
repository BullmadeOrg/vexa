import "server-only";
import { StackServerApp } from "@stackframe/stack";

/**
 * Bullmade identity provider. The SDK reads the project id, publishable key,
 * and server key from the standard Stack Auth environment variables.
 */
export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: { handler: "/handler" },
});
