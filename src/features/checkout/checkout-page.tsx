"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { type Cart } from "@/domain/cart";
import { type Customer } from "@/domain/customer";
import { type Product } from "@/domain/product";
import { type Shop } from "@/domain/shop";

import { CartTable } from "./cart-table";
import {
  addProductToCart,
  getCheckoutPreparation,
  prepareCheckout,
  removeCartItem,
  updateCartItemQuantity,
  type CheckoutReadiness,
} from "./checkout-service";
import { toCartViewModel } from "./checkout-view-model";
import { CustomerForm, type CustomerFormValues } from "./customer-form";
import { ProductSelection } from "./product-selection";

type CheckoutPageProps = {
  shopId: string;
};

type CheckoutPageState = {
  cart?: Cart;
  customer?: Customer;
  products: Product[];
  shop?: Shop;
};

export function CheckoutPage({ shopId }: CheckoutPageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [readiness, setReadiness] = useState<CheckoutReadiness | undefined>();
  const [state, setState] = useState<CheckoutPageState>({
    products: [],
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setState(getCheckoutPreparation(shopId));
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [shopId]);

  function refresh() {
    setState(getCheckoutPreparation(shopId));
  }

  function handleAddProduct(product: Product) {
    if (!state.shop) {
      return;
    }

    try {
      addProductToCart(state.shop, product);
      setError("");
      refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update cart.");
    }
  }

  function handleQuantityChange(productId: string, quantity: number) {
    if (!state.cart) {
      return;
    }

    updateCartItemQuantity(state.cart, productId, quantity);
    refresh();
  }

  function handleRemove(productId: string) {
    if (!state.cart) {
      return;
    }

    removeCartItem(state.cart, productId);
    refresh();
  }

  function handlePrepareCheckout(values: CustomerFormValues) {
    if (!state.cart) {
      setError("Add products before preparing checkout.");
      return;
    }

    try {
      setReadiness(prepareCheckout(state.cart, values));
      setError("");
      refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Checkout preparation failed.");
    }
  }

  if (!loaded) {
    return <LoadingState title="Loading checkout preparation" />;
  }

  if (!state.shop) {
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
        description="Create or select a shop before preparing checkout."
        title="No selected shop"
      />
    );
  }

  const cartViewModel = state.cart ? toCartViewModel(state.cart) : undefined;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{state.shop.name} checkout preparation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build a cart and collect customer information before later checkout execution.
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
          href={`/shops/${state.shop.id}/products`}
        >
          Products
        </Link>
      </div>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <ProductSelection onAddProduct={handleAddProduct} products={state.products} />

      <CartTable
        cart={state.cart}
        onQuantityChange={handleQuantityChange}
        onRemove={handleRemove}
      />

      <Card>
        <CardHeader>
          <CardTitle>Customer information</CardTitle>
          <CardDescription>
            Collect checkout participant details without authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm onSubmit={handlePrepareCheckout} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Checkout readiness</CardTitle>
            <Badge variant={readiness?.ready ? "success" : "neutral"}>
              {readiness?.ready ? "Ready" : "Not ready"}
            </Badge>
          </div>
          <CardDescription>
            This confirms prepared local data only. Execution is intentionally outside this phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm md:grid-cols-3">
            <SummaryItem label="Shop" value={state.shop.name} />
            <SummaryItem label="Items" value={(state.cart?.items.length ?? 0).toString()} />
            <SummaryItem
              label="Total"
              value={
                cartViewModel ? `${cartViewModel.total} ${cartViewModel.currency}` : "No cart total"
              }
            />
            <SummaryItem label="Customer" value={readiness?.customer.name ?? "Not collected"} />
            <SummaryItem
              label="Customer email"
              value={readiness?.customer.email ?? "Not collected"}
            />
            <SummaryItem label="Prepared input" value={readiness ? "Available" : "Pending"} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-medium">{value}</dd>
    </div>
  );
}
