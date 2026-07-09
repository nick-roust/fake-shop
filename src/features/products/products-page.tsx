"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { type Shop } from "@/domain/shop";
import { type Category, type Product } from "@/domain/product";

import { ProductForm, type ProductFormValues } from "./product-form";
import { ProductList } from "./product-list";
import { createManagedProduct, getProductCatalog, updateManagedProduct } from "./product-service";

type ProductsPageProps = {
  shopId: string;
};

type ProductCatalogState = {
  categories: Category[];
  products: Product[];
  shop?: Shop;
};

export function ProductsPage({ shopId }: ProductsPageProps) {
  const [loaded, setLoaded] = useState(false);
  const [catalog, setCatalog] = useState<ProductCatalogState>({
    categories: [],
    products: [],
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCatalog(getProductCatalog(shopId));
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [shopId]);

  function refreshCatalog() {
    setCatalog(getProductCatalog(shopId));
  }

  function handleCreateProduct(values: ProductFormValues) {
    if (!catalog.shop) {
      return;
    }

    createManagedProduct(catalog.shop, values);
    refreshCatalog();
  }

  function handleEditProduct(product: Product, values: ProductFormValues) {
    updateManagedProduct(product, values);
    refreshCatalog();
  }

  if (!loaded) {
    return <LoadingState title="Loading products" />;
  }

  if (!catalog.shop) {
    return (
      <EmptyState
        action={
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
            href="/shops"
          >
            Back to shops
          </Link>
        }
        description="Create or select a shop before managing products."
        title="No selected shop"
      />
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{catalog.shop.name} products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage demo products that belong to this shop.
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
          href={`/shops/${catalog.shop.id}`}
        >
          Shop details
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create product</CardTitle>
          <CardDescription>Add a sample product to this shop catalog.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            categories={catalog.categories}
            onSubmit={handleCreateProduct}
            submitLabel="Create product"
          />
        </CardContent>
      </Card>

      <ProductList
        categories={catalog.categories}
        onEditProduct={handleEditProduct}
        products={catalog.products}
      />
    </div>
  );
}
