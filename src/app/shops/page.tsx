import { AppShell } from "@/components/shell/app-shell";
import { PageContainer } from "@/components/shell/page-container";
import { ShopsPage } from "@/features/shops";

export default function ShopsRoute() {
  return (
    <AppShell>
      <PageContainer>
        <ShopsPage />
      </PageContainer>
    </AppShell>
  );
}
