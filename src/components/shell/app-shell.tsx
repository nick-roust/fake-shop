import type { ReactNode } from "react";
import { Header } from "@/components/shell/header";
import { Navigation } from "@/components/shell/navigation";
import { Container } from "@/components/ui/layout";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Container className="grid gap-6 py-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Navigation />
        <main className="min-w-0">{children}</main>
      </Container>
    </div>
  );
}
