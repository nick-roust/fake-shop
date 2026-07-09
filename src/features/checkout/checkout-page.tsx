"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { type Cart } from "@/domain/cart";
import { type CheckoutSession, type CheckoutSessionStatus } from "@/domain/checkout";
import { type Customer } from "@/domain/customer";
import { type Order } from "@/domain/order";
import { type Product } from "@/domain/product";
import { type Shop } from "@/domain/shop";
import { type IntegrationConfiguration } from "@/storage/types";

import { CartTable } from "./cart-table";
import {
  addProductToCart,
  getCheckoutPreparation,
  prepareCheckout,
  removeCartItem,
  runExternalCheckoutBoundary,
  runMockCheckout,
  updateCheckoutSessionStatus,
  updateCartItemQuantity,
  type CheckoutReadiness,
  type ExternalCheckoutExecution,
  type MockCheckoutExecution,
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
  integrationConfiguration?: IntegrationConfiguration;
  order?: Order;
  products: Product[];
  session?: CheckoutSession;
  shop?: Shop;
};

export function CheckoutPage({ shopId }: CheckoutPageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [externalExecution, setExternalExecution] = useState<
    ExternalCheckoutExecution | undefined
  >();
  const [mockScenario, setMockScenario] = useState<MockCheckoutExecution["scenario"]>("success");
  const [mockExecution, setMockExecution] = useState<MockCheckoutExecution | undefined>();
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

  function handleStatusChange(nextStatus: CheckoutSessionStatus) {
    const session = readiness?.session ?? state.session;

    if (!session) {
      setError("Create a checkout session before changing status.");
      return;
    }

    try {
      const updatedSession = updateCheckoutSessionStatus(session, nextStatus, {
        message: `Status changed to ${nextStatus}.`,
        recordedAt: new Date().toISOString(),
      });

      setReadiness((current) =>
        current
          ? {
              ...current,
              session: updatedSession,
            }
          : undefined
      );
      setState((current) => ({ ...current, session: updatedSession }));
      setError("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Status transition rejected.");
    }
  }

  function handleRunMockCheckout() {
    const session = readiness?.session ?? state.session;

    if (!session) {
      setError("Create a checkout session before running mock checkout.");
      return;
    }

    try {
      const execution = runMockCheckout(session, mockScenario);

      setMockExecution(execution);
      setReadiness((current) =>
        current
          ? {
              ...current,
              order: execution.order,
              session: execution.session,
            }
          : undefined
      );
      setState((current) => ({
        ...current,
        order: execution.order,
        session: execution.session,
      }));
      setError("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Mock checkout failed.");
    }
  }

  function handleRunExternalCheckoutBoundary() {
    const session = readiness?.session ?? state.session;

    if (!session) {
      setError("Create a checkout session before running external checkout boundary.");
      return;
    }

    try {
      const execution = runExternalCheckoutBoundary(session);

      setExternalExecution(execution);
      setReadiness((current) =>
        current
          ? {
              ...current,
              order: execution.order,
              session: execution.session,
            }
          : undefined
      );
      setState((current) => ({
        ...current,
        order: execution.order,
        session: execution.session,
      }));
      setError("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "External checkout boundary failed."
      );
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
  const integrationMode = state.integrationConfiguration?.mode ?? "mock";
  const externalConfigurationReady = Boolean(
    state.integrationConfiguration?.externalBaseUrl &&
    state.integrationConfiguration?.externalReference
  );
  const visibleOrder = readiness?.order ?? state.order;
  const visibleSession = readiness?.session ?? state.session;

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

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Adapter selection</CardTitle>
            <Badge variant={integrationMode === "mock" ? "success" : "info"}>
              {integrationMode}
            </Badge>
          </div>
          <CardDescription>
            Checkout execution uses the configured shop mode through the adapter boundary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm md:grid-cols-3">
            <SummaryItem label="Selected mode" value={integrationMode} />
            <SummaryItem
              label="Configuration"
              value={externalConfigurationReady || integrationMode === "mock" ? "Ready" : "Missing"}
            />
            <SummaryItem
              label="External reference"
              value={state.integrationConfiguration?.externalReference ?? "Not configured"}
            />
          </dl>
        </CardContent>
      </Card>

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
            This creates the local order and checkout session only. Execution is intentionally
            outside this phase.
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
            <SummaryItem label="Order" value={visibleOrder?.id ?? "Not created"} />
            <SummaryItem label="Checkout session" value={visibleSession?.id ?? "Not created"} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Checkout session</CardTitle>
            <Badge variant={visibleSession ? "info" : "neutral"}>
              {visibleSession?.status ?? "Not created"}
            </Badge>
          </div>
          <CardDescription>
            Session state is visible and follows the neutral fake-shop lifecycle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {visibleSession && visibleOrder ? (
            <div className="grid gap-4">
              <dl className="grid gap-3 text-sm md:grid-cols-3">
                <SummaryItem label="Session id" value={visibleSession.id} />
                <SummaryItem label="Related order" value={visibleOrder.id} />
                <SummaryItem label="Created" value={visibleSession.createdAt} />
                <SummaryItem label="Status" value={visibleSession.status} />
                <SummaryItem
                  label="Result placeholder"
                  value={visibleSession.result?.message ?? "No result recorded"}
                />
                <SummaryItem
                  label="Result time"
                  value={visibleSession.result?.recordedAt ?? "No result recorded"}
                />
              </dl>
              <div className="flex flex-wrap gap-3">
                <StatusButton
                  disabled={visibleSession.status !== "created"}
                  label="Mark pending"
                  onClick={() => handleStatusChange("pending")}
                />
                <StatusButton
                  disabled={visibleSession.status !== "pending"}
                  label="Mark succeeded"
                  onClick={() => handleStatusChange("succeeded")}
                />
                <StatusButton
                  disabled={visibleSession.status !== "pending"}
                  label="Mark failed"
                  onClick={() => handleStatusChange("failed")}
                />
                <StatusButton
                  disabled={visibleSession.status !== "pending"}
                  label="Mark cancelled"
                  onClick={() => handleStatusChange("cancelled")}
                />
              </div>
            </div>
          ) : (
            <EmptyState
              description="Submit checkout preparation to create a local order and checkout session."
              title="No checkout session"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Mock checkout adapter</CardTitle>
            <Badge variant={mockExecution ? "success" : "neutral"}>
              {mockExecution?.adapterName ?? "Not run"}
            </Badge>
          </div>
          <CardDescription>
            Run a local adapter scenario and map the normalized result into checkout session state.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {visibleSession ? (
            <div className="grid gap-4">
              <div className="grid gap-2 sm:max-w-xs">
                <label className="text-sm font-medium" htmlFor="mock-checkout-scenario">
                  Mock scenario
                </label>
                <select
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm"
                  id="mock-checkout-scenario"
                  onChange={(event) =>
                    setMockScenario(event.target.value as MockCheckoutExecution["scenario"])
                  }
                  value={mockScenario}
                >
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button
                className="inline-flex h-10 w-fit items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                disabled={visibleSession.status !== "created"}
                onClick={handleRunMockCheckout}
                type="button"
              >
                Run mock checkout
              </button>
              {mockExecution ? (
                <dl className="grid gap-3 text-sm md:grid-cols-3">
                  <SummaryItem label="Selected adapter" value={mockExecution.adapterName} />
                  <SummaryItem label="Scenario" value={mockExecution.scenario} />
                  <SummaryItem label="Result" value={mockExecution.status} />
                  <SummaryItem label="Executed" value={mockExecution.executedAt} />
                  <SummaryItem label="Diagnostics" value={mockExecution.message} />
                  <SummaryItem label="Adapter id" value={mockExecution.adapterId} />
                </dl>
              ) : null}
            </div>
          ) : (
            <EmptyState
              description="Submit checkout preparation before running mock checkout."
              title="No checkout session"
            />
          )}
        </CardContent>
      </Card>

      {integrationMode === "external" ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>External checkout boundary</CardTitle>
              <Badge variant={externalExecution ? "warning" : "neutral"}>
                {externalExecution?.adapterName ?? "Not run"}
              </Badge>
            </div>
            <CardDescription>
              Prepare the external adapter path and normalize the local boundary result without a
              network call.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {visibleSession ? (
              <div className="grid gap-4">
                <button
                  className="inline-flex h-10 w-fit items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                  disabled={visibleSession.status !== "created"}
                  onClick={handleRunExternalCheckoutBoundary}
                  type="button"
                >
                  Prepare external boundary
                </button>
                {externalExecution ? (
                  <dl className="grid gap-3 text-sm md:grid-cols-3">
                    <SummaryItem label="Selected adapter" value={externalExecution.adapterName} />
                    <SummaryItem label="Mode" value={externalExecution.mode} />
                    <SummaryItem label="Scenario" value={externalExecution.scenario} />
                    <SummaryItem label="Result" value={externalExecution.status} />
                    <SummaryItem
                      label="Configuration"
                      value={externalExecution.configurationReady ? "Ready" : "Missing"}
                    />
                    <SummaryItem label="Diagnostics" value={externalExecution.message} />
                  </dl>
                ) : null}
              </div>
            ) : (
              <EmptyState
                description="Submit checkout preparation before preparing external checkout."
                title="No checkout session"
              />
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function StatusButton({
  disabled,
  label,
  onClick,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
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
