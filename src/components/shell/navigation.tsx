import { navigationItems } from "@/config/navigation";

export function Navigation() {
  return (
    <nav aria-label="Primary navigation" className="rounded-md border border-border bg-card p-2">
      <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
        {navigationItems.map((item) => (
          <li key={item.href}>
            <a
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              href={item.href}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
