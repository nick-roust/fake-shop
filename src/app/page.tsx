import { AppShell } from "@/components/shell/app-shell";
import { PageContainer } from "@/components/shell/page-container";
import { DashboardPage } from "@/features/dashboard";

export default function HomePage() {
  return (
    <AppShell>
      <PageContainer>
        <DashboardPage />
      </PageContainer>
    </AppShell>
  );
}
