- **Bullmade login no longer crashes after clicking Continue.** Stack Auth's required browser
  policy is now limited to its own login routes, while the rest of Vexa keeps the stricter policy;
  unused Stripe loading and Stack analytics are also disabled on the internal login flow.
