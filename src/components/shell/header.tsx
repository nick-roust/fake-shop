import { appConfig } from "@/config/app";
import { ThemeSwitcher } from "@/components/shell/theme-switcher";
import { Container } from "@/components/ui/layout";

export function Header() {
  return (
    <header className="border-b border-border bg-background/95">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{appConfig.name}</p>
          <p className="hidden text-xs text-muted-foreground sm:block">{appConfig.description}</p>
        </div>
        <ThemeSwitcher />
      </Container>
    </header>
  );
}
