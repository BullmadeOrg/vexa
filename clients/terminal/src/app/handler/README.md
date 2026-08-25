# handler

Stack Auth's terminal-owned route group. The layout supplies Stack's provider and theme only to
the sign-in/account handler pages, keeping the rest of the terminal independent of Stack's client
runtime.

The catch-all child route renders the appropriate Stack Auth screen for paths such as
`/handler/sign-in`.
