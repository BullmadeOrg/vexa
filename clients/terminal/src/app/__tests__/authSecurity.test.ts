import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import nextConfig from "../../../next.config";

function cspValue(headers: Array<{ key: string; value: string }>) {
  return headers.find((header) => header.key === "Content-Security-Policy")?.value ?? "";
}

describe("Stack Auth browser security", () => {
  it("limits unsafe-eval to the Stack Auth handler routes", async () => {
    const entries = await nextConfig.headers!();
    const defaultRoute = entries.find((entry) => entry.source === "/:path*");
    const handlerRoute = entries.find((entry) => entry.source === "/handler/:path*");

    expect(defaultRoute).toBeDefined();
    expect(handlerRoute).toBeDefined();
    expect(cspValue(defaultRoute!.headers)).not.toContain("'unsafe-eval'");
    expect(cspValue(handlerRoute!.headers)).toContain("'unsafe-eval'");
  });

  it("uses Stripe's lazy loader so sign-in does not fetch Stripe.js", () => {
    expect(nextConfig.webpack).toBeTypeOf("function");

    const webpackConfig = { resolve: { alias: {} as Record<string, string> } };
    const resolved = nextConfig.webpack!(webpackConfig as never, {} as never) as typeof webpackConfig;

    expect(resolved.resolve.alias["@stripe/stripe-js$"]).toBe("@stripe/stripe-js/pure");
  });
});

describe("Stack Auth telemetry", () => {
  it("is disabled for the internal Bullmade deployment", () => {
    const stackModule = readFileSync(resolve("src/stack.ts"), "utf8");

    expect(stackModule).toMatch(/analytics:\s*\{\s*enabled:\s*false\s*\}/);
  });
});
