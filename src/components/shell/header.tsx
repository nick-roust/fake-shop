import { appConfig } from "@/config/app";
import { ThemeSwitcher } from "@/components/shell/theme-switcher";
import { Container } from "@/components/ui/layout";

export function Header() {
  return (
    <header className="border-b border-border bg-background/95">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-card"
          >
            <StoreIcon />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-wide">{appConfig.name}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">{appConfig.description}</p>
          </div>
        </div>
        <ThemeSwitcher />
      </Container>
    </header>
  );
}

function StoreIcon() {
  return (
    <svg
      className="size-5 text-foreground"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M4 10h16" />
      <path d="M5 10l1.2-5h11.6L19 10" />
      <path d="M6 10v9h12v-9" />
      <path d="M9 19v-5h6v5" />
      <path d="M8 10c0 1.1.9 2 2 2s2-.9 2-2" />
      <path d="M12 10c0 1.1.9 2 2 2s2-.9 2-2" />
    </svg>
  );
}
