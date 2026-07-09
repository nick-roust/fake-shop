import type { ReactNode } from "react";
import { Header } from "@/components/shell/header";
import { Navigation } from "@/components/shell/navigation";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <Navigation />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
