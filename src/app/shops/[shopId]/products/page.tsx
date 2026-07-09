import { AppShell } from "@/components/shell/app-shell";
import { PageContainer } from "@/components/shell/page-container";
import { ProductsPage } from "@/features/products";

type ProductsRouteProps = {
  params: Promise<{
    shopId: string;
  }>;
};

export default async function ProductsRoute({ params }: ProductsRouteProps) {
  const { shopId } = await params;

  return (
    <AppShell>
      <PageContainer>
        <ProductsPage shopId={shopId} />
      </PageContainer>
    </AppShell>
  );
}
