import { appConfig } from "@/config/app";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-2xl space-y-6 text-center">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Project Foundation</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{appConfig.name}</h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            The application foundation is ready for bounded implementation phases.
          </p>
        </div>
        <Button type="button">Foundation Ready</Button>
      </section>
    </main>
  );
}
