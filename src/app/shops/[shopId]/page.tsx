import { AppShell } from "@/components/shell/app-shell";
import { PageContainer } from "@/components/shell/page-container";
import { ShopDetailsPage } from "@/features/shops";

type ShopDetailsRouteProps = {
  params: Promise<{
    shopId: string;
  }>;
};

export default async function ShopDetailsRoute({ params }: ShopDetailsRouteProps) {
  const { shopId } = await params;

  return (
    <AppShell>
      <PageContainer>
        <ShopDetailsPage shopId={shopId} />
      </PageContainer>
    </AppShell>
  );
}
