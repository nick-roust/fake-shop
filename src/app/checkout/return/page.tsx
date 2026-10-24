import { AppShell } from "@/components/shell/app-shell";
import { PageContainer } from "@/components/shell/page-container";
import { CheckoutReturnPage } from "@/features/checkout";

type CheckoutReturnRouteProps = {
  searchParams: Promise<{ sessionId?: string }>;
};

export default async function CheckoutReturnRoute({ searchParams }: CheckoutReturnRouteProps) {
  const { sessionId } = await searchParams;
  return (
    <AppShell>
      <PageContainer>
        <CheckoutReturnPage sessionId={sessionId ?? ""} />
      </PageContainer>
    </AppShell>
  );
}
