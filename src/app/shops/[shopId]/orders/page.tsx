import { AppShell } from "@/components/shell/app-shell";
import { PageContainer } from "@/components/shell/page-container";
import { OrdersPage } from "@/features/orders";

type OrdersRouteProps = {
  params: Promise<{
    shopId: string;
  }>;
};

export default async function OrdersRoute({ params }: OrdersRouteProps) {
  const { shopId } = await params;

  return (
    <AppShell>
      <PageContainer>
        <OrdersPage shopId={shopId} />
      </PageContainer>
    </AppShell>
  );
}
