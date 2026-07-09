import { AppShell } from "@/components/shell/app-shell";
import { PageContainer } from "@/components/shell/page-container";
import { CheckoutPage } from "@/features/checkout";

type CheckoutRouteProps = {
  params: Promise<{
    shopId: string;
  }>;
};

export default async function CheckoutRoute({ params }: CheckoutRouteProps) {
  const { shopId } = await params;

  return (
    <AppShell>
      <PageContainer>
        <CheckoutPage shopId={shopId} />
      </PageContainer>
    </AppShell>
  );
}
