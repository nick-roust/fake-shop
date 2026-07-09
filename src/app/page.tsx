import { AppShell } from "@/components/shell/app-shell";
import { PageContainer } from "@/components/shell/page-container";
import { navigationItems } from "@/config/navigation";

export default function HomePage() {
  return (
    <AppShell>
      <PageContainer>
        <div className="rounded-md border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Application Shell</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">fake-shop workspace</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            The shell is ready to host future product areas. This page is a foundation surface only
            and does not include business features.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {navigationItems.map((item) => (
            <section
              className="rounded-md border border-border bg-card p-4"
              id={item.href.slice(1)}
              key={item.href}
            >
              <h2 className="text-base font-semibold">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </section>
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}
