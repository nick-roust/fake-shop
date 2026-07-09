import { AppShell } from "@/components/shell/app-shell";
import { PageContainer } from "@/components/shell/page-container";
import { DeveloperExperiencePage } from "@/features/developer-experience";

export default function DeveloperRoute() {
  return (
    <AppShell>
      <PageContainer>
        <DeveloperExperiencePage />
      </PageContainer>
    </AppShell>
  );
}
