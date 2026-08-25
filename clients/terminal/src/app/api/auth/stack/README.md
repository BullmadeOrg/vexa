# api/auth/stack

`GET /api/auth/stack` exchanges a verified Stack Auth session for Vexa's internal user token and
sets the terminal's scoped, HTTP-only auth cookies. Access is limited to the configured email
domains, and redirects are restricted to local paths.

Stack Auth owns sign-in and identity; Vexa continues to own authorization for meetings,
transcripts, recordings, and terminal API calls.
