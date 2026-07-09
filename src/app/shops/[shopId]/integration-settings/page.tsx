import { AppShell } from "@/components/shell/app-shell";
import { PageContainer } from "@/components/shell/page-container";
import { IntegrationSettingsPage } from "@/features/integration-settings";

type IntegrationSettingsRouteProps = {
  params: Promise<{
    shopId: string;
  }>;
};

export default async function IntegrationSettingsRoute({ params }: IntegrationSettingsRouteProps) {
  const { shopId } = await params;

  return (
    <AppShell>
      <PageContainer>
        <IntegrationSettingsPage shopId={shopId} />
      </PageContainer>
    </AppShell>
  );
}
