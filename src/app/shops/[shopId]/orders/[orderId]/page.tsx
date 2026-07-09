import { AppShell } from "@/components/shell/app-shell";
import { PageContainer } from "@/components/shell/page-container";
import { OrderDetailsPage } from "@/features/orders";

type OrderDetailsRouteProps = {
  params: Promise<{
    orderId: string;
    shopId: string;
  }>;
};

export default async function OrderDetailsRoute({ params }: OrderDetailsRouteProps) {
  const { orderId, shopId } = await params;

  return (
    <AppShell>
      <PageContainer>
        <OrderDetailsPage orderId={orderId} shopId={shopId} />
      </PageContainer>
    </AppShell>
  );
}
