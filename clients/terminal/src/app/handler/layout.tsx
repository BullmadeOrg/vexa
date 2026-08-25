import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack";

/** Stack's client runtime is needed only on its own sign-in/account pages. */
export default function HandlerLayout({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider app={stackServerApp}>
      <StackTheme>{children}</StackTheme>
    </StackProvider>
  );
}
