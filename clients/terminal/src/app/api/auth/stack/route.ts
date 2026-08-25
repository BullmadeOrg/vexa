/**
 * Exchange a verified Stack Auth session for Vexa's scoped, internal token.
 * Stack owns identity; Vexa continues to own authorization for bots,
 * transcripts, recordings, and the terminal API.
 */
import { NextResponse, type NextRequest } from "next/server";
import { stackServerApp } from "@/stack";
import { AUTH_COOKIE, USER_INFO_COOKIE, findOrCreateUserToken } from "../adminApi";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const NO_STORE = "no-store, no-cache, must-revalidate";

function isSecureRequest(): boolean {
  return (
    (process.env.TERMINAL_URL || "").startsWith("https://") ||
    (process.env.NEXTAUTH_URL || "").startsWith("https://")
  );
}

function safeReturnTo(value: string | null): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function publicOrigin(request: NextRequest): string {
  const configured = process.env.TERMINAL_URL || process.env.NEXTAUTH_URL;
  if (!configured) return request.nextUrl.origin;
  try {
    return new URL(configured).origin;
  } catch {
    return request.nextUrl.origin;
  }
}

function isAllowedEmail(email: string): boolean {
  const allowedDomains = (process.env.STACK_ALLOWED_EMAIL_DOMAINS || "bullmade.dk")
    .split(",")
    .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
  const domain = email.split("@").at(-1);
  return Boolean(domain && allowedDomains.includes(domain));
}

function authError(request: NextRequest, code: string) {
  const url = new URL("/", publicOrigin(request));
  url.searchParams.set("auth_error", code);
  return NextResponse.redirect(url, { headers: { "Cache-Control": NO_STORE } });
}

export async function GET(request: NextRequest) {
  const user = await stackServerApp.getUser().catch(() => null);
  if (!user) {
    const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const url = new URL("/handler/sign-in", publicOrigin(request));
    url.searchParams.set("after_auth_return_to", returnTo);
    return NextResponse.redirect(url, { headers: { "Cache-Control": NO_STORE } });
  }

  const email = user.primaryEmail?.trim().toLowerCase();
  if (!email) return authError(request, "missing_email");
  if (!isAllowedEmail(email)) return authError(request, "email_not_allowed");

  const result = await findOrCreateUserToken(email);
  if (!result.ok) return authError(request, "vexa_token");

  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("return_to"));
  const response = NextResponse.redirect(new URL(returnTo, publicOrigin(request)), {
    headers: { "Cache-Control": NO_STORE },
  });
  const opts = {
    httpOnly: true,
    secure: isSecureRequest(),
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  };
  response.cookies.set(AUTH_COOKIE, result.token, opts);
  response.cookies.set(
    USER_INFO_COOKIE,
    JSON.stringify({
      email: result.user.email,
      name: user.displayName || result.user.name || result.user.email.split("@")[0],
    }),
    opts,
  );
  return response;
}
