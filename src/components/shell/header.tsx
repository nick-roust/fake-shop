import { appConfig } from "@/config/app";
import { ThemeSwitcher } from "@/components/shell/theme-switcher";

export function Header() {
  return (
    <header className="border-b border-border bg-background/95">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{appConfig.name}</p>
          <p className="hidden text-xs text-muted-foreground sm:block">{appConfig.description}</p>
        </div>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
