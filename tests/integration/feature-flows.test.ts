import assert from "node:assert/strict";
import test from "node:test";

import {
  addProductToCart,
  prepareCheckout,
  runMockCheckout,
  startSimulatedRedirectCheckout,
  getCheckoutRecovery,
  reconcilePendingCheckout,
  simulateCheckoutReturn,
  startCheckoutWithAdapter,
  runExternalCheckoutBoundary,
  updateCheckoutSessionStatus,
} from "../../src/features/checkout/checkout-service";
import {
  createManagedProduct,
  getProductCatalog,
} from "../../src/features/products/product-service";
import { createManagedShop, listShops } from "../../src/features/shops/shop-service";
import { listShopOrders } from "../../src/features/orders/order-service";
import {
  getLocalDemoRepositories,
  resetLocalDemoState,
} from "../../src/storage/local-demo-boundary";
import { type CheckoutAdapter } from "../../src/integrations/checkout";
import { type CheckoutResult } from "../../src/integrations/checkout/adapter";

function createPreparedCheckout(shopName: string) {
  const shop = createManagedShop({
    name: shopName,
    displayName: shopName,
    accentColor: "#2563eb",
    description: "Test shop",
    category: "Demo",
    scenario: "Checkout recovery",
  });
  const product = createManagedProduct(shop, {
    name: "Item",
    description: "Item",
    price: "5",
    currency: "USD",
    active: true,
    categoryName: "Items",
  });
  return prepareCheckout(addProductToCart(shop, product), {
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "US",
    email: "",
    firstName: "Test",
    lastName: "Buyer",
    phone: "",
    postalCode: "",
    region: "",
  });
}

test("shop and product creation use repository boundaries", () => {
  resetLocalDemoState();

  const shop = createManagedShop({
    category: "Demo",
    description: "Test shop",
    displayName: "Test Shop",
    accentColor: "#2563eb",
    name: "Test Shop",
    scenario: "Mock checkout",
  });
  const product = createManagedProduct(shop, {
    active: true,
    categoryName: "Stationery",
    currency: "USD",
    description: "Test product",
    name: "Test Notebook",
    price: "12.50",
  });
  const catalog = getProductCatalog(shop.id);

  assert.equal(listShops().length, 1);
  assert.equal(product.shopId, shop.id);
  assert.equal(catalog.products.length, 1);
  assert.equal(catalog.categories[0]?.name, "Stationery");
});

test("checkout preparation creates order and checkout session without executing adapter", () => {
  resetLocalDemoState();

  const shop = createManagedShop({
    category: "Demo",
    description: "Checkout shop",
    displayName: "Checkout Shop",
    accentColor: "#059669",
    name: "Checkout Shop",
    scenario: "Mock checkout",
  });
  const product = createManagedProduct(shop, {
    active: true,
    categoryName: "Stationery",
    currency: "USD",
    description: "Checkout product",
    name: "Checkout Notebook",
    price: "20",
  });
  const cart = addProductToCart(shop, product);
  const readiness = prepareCheckout(cart, {
    addressLine1: "100 Test Street",
    addressLine2: "",
    city: "Test City",
    country: "US",
    email: "buyer@example.test",
    firstName: "Buyer",
    lastName: "Demo",
    phone: "",
    postalCode: "90000",
    region: "CA",
  });

  assert.equal(readiness.ready, true);
  assert.equal(readiness.order.status, "created");
  assert.equal(readiness.session.status, "created");
});

test("mock checkout result is visible through order management", async () => {
  resetLocalDemoState();

  const shop = createManagedShop({
    category: "Demo",
    description: "Order shop",
    displayName: "Order Shop",
    accentColor: "#7c3aed",
    name: "Order Shop",
    scenario: "Mock checkout",
  });
  const product = createManagedProduct(shop, {
    active: true,
    categoryName: "Stationery",
    currency: "USD",
    description: "Order product",
    name: "Order Notebook",
    price: "10",
  });
  const cart = addProductToCart(shop, product);
  const readiness = prepareCheckout(cart, {
    addressLine1: "100 Test Street",
    addressLine2: "",
    city: "Test City",
    country: "US",
    email: "buyer@example.test",
    firstName: "Buyer",
    lastName: "Demo",
    phone: "",
    postalCode: "90000",
    region: "CA",
  });
  const execution = await runMockCheckout(readiness.session, "success");
  const orders = listShopOrders(shop.id);

  assert.equal(execution.status, "succeeded");
  assert.equal(execution.order.status, "completed");
  assert.equal(orders.length, 1);
  assert.equal(orders[0]?.session?.status, "succeeded");
});

test("simulated redirect persists pending before initiation resolves and reconciles idempotently", async () => {
  resetLocalDemoState();
  const shop = createManagedShop({
    name: "Recovery Shop",
    displayName: "Recovery Shop",
    accentColor: "#2563eb",
    description: "Test shop",
    category: "Demo",
    scenario: "Recovery",
  });
  const product = createManagedProduct(shop, {
    name: "Item",
    description: "Item",
    price: "5",
    currency: "USD",
    active: true,
    categoryName: "Items",
  });
  const readiness = prepareCheckout(addProductToCart(shop, product), {
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "US",
    email: "",
    firstName: "Test",
    lastName: "Buyer",
    phone: "",
    postalCode: "",
    region: "",
  });

  const initiation = startSimulatedRedirectCheckout(readiness.session);
  const storedPending = getLocalDemoRepositories().checkoutSessions.getById(readiness.session.id);
  assert.equal(storedPending?.status, "pending");
  assert.equal(storedPending?.adapterId, "simulated-redirect-checkout");
  const duplicate = startSimulatedRedirectCheckout(readiness.session);
  await assert.rejects(duplicate, /already in progress/);

  const started = await initiation;
  assert.equal(started.status, "pending");
  assert.equal(started.session.result?.externalReference, `simulated-${readiness.session.id}`);
  assert.equal(getCheckoutRecovery(readiness.session.id).kind, "pending");
  assert.equal(
    getLocalDemoRepositories().checkoutSessions.getById(readiness.session.id)?.status,
    "pending"
  );
  const sessions = getLocalDemoRepositories().checkoutSessions;
  sessions.save({ ...started.session, adapterId: "different-adapter" });
  assert.equal((await simulateCheckoutReturn(readiness.session.id)).kind, "wrong-adapter-binding");
  sessions.save({
    ...started.session,
    result: { ...started.session.result, externalReference: undefined },
  });
  const missingSimulationReference = await simulateCheckoutReturn(readiness.session.id);
  assert.equal(missingSimulationReference.kind, "unsupported");
  sessions.save(started.session);
  const returned = await simulateCheckoutReturn(readiness.session.id);
  assert.equal(returned.kind, "reconciled");
  if (returned.kind !== "reconciled") return;
  assert.equal(returned.session.status, "succeeded");
  assert.equal(returned.session.result?.provenance, "simulated");
  assert.equal(
    returned.session.result?.externalReference,
    started.session.result?.externalReference
  );
  assert.equal(returned.session.result?.redirectUrl, undefined);
  const storedTerminal = returned.session;
  const repeated = await simulateCheckoutReturn(readiness.session.id);
  assert.equal(repeated.kind, "already-terminal");
  if (repeated.kind === "already-terminal") assert.deepEqual(repeated.session, storedTerminal);
  const conflictingAdapter: CheckoutAdapter<"conflicting-return"> = {
    id: "simulated-redirect-checkout",
    name: "Conflicting adapter result",
    async execute() {
      return {
        kind: "unsupported",
        diagnostics: {
          adapterId: this.id,
          adapterName: this.name,
          scenario: "unused",
          message: "unused",
          executedAt: new Date().toISOString(),
          provenance: "simulated",
        },
      };
    },
    async reconcile() {
      return {
        kind: "completed",
        status: "failed",
        diagnostics: {
          adapterId: this.id,
          adapterName: this.name,
          scenario: "conflicting-return",
          message: "Conflicting simulated result.",
          executedAt: new Date().toISOString(),
          provenance: "simulated",
        },
      };
    },
  };
  const conflicting = await reconcilePendingCheckout(readiness.session.id, conflictingAdapter);
  assert.equal(conflicting.kind, "already-terminal");
  if (conflicting.kind === "already-terminal")
    assert.equal(conflicting.session.status, "succeeded");
  await assert.rejects(startSimulatedRedirectCheckout(readiness.session), /not ready to start/);
});

test("uncertain adapter initiation failure leaves recoverable pending state and does not retry", async () => {
  resetLocalDemoState();
  const shop = createManagedShop({
    name: "Unknown Shop",
    displayName: "Unknown Shop",
    accentColor: "#2563eb",
    description: "Test shop",
    category: "Demo",
    scenario: "Recovery",
  });
  const product = createManagedProduct(shop, {
    name: "Item",
    description: "Item",
    price: "5",
    currency: "USD",
    active: true,
    categoryName: "Items",
  });
  const readiness = prepareCheckout(addProductToCart(shop, product), {
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "US",
    email: "",
    firstName: "Test",
    lastName: "Buyer",
    phone: "",
    postalCode: "",
    region: "",
  });
  let calls = 0;
  const uncertain: CheckoutAdapter<"one-shot"> = {
    id: "uncertain-test-adapter",
    name: "Uncertain test adapter",
    async execute() {
      calls += 1;
      throw new Error("connection interrupted");
    },
  };
  const result = await startCheckoutWithAdapter(readiness.session, uncertain, "one-shot");
  assert.equal(calls, 1);
  assert.equal(result.session.status, "pending");
  assert.match(result.session.result?.message ?? "", /outcome is unknown/);
  await assert.rejects(
    startCheckoutWithAdapter(result.session, uncertain, "one-shot"),
    /not ready to start/
  );
  assert.equal(calls, 1);
});

test("external placeholder reports unsupported without changing checkout state", () => {
  resetLocalDemoState();
  const shop = createManagedShop({
    name: "External Shop",
    displayName: "External Shop",
    accentColor: "#2563eb",
    description: "Test shop",
    category: "Demo",
    scenario: "External",
  });
  const product = createManagedProduct(shop, {
    name: "Item",
    description: "Item",
    price: "5",
    currency: "USD",
    active: true,
    categoryName: "Items",
  });
  const readiness = prepareCheckout(addProductToCart(shop, product), {
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "US",
    email: "",
    firstName: "Test",
    lastName: "Buyer",
    phone: "",
    postalCode: "",
    region: "",
  });
  getLocalDemoRepositories().integrationConfigurations.save({
    id: `integration-${shop.id}`,
    shopId: shop.id,
    mode: "external",
    externalBaseUrl: "https://example.test",
    externalReference: "label",
    updatedAt: new Date().toISOString(),
  });
  const execution = runExternalCheckoutBoundary(readiness.session);
  assert.equal(execution.status, "created");
  assert.equal(execution.session.status, "created");
  assert.match(execution.message, /unsupported and was not executed/);
  assert.equal(
    getLocalDemoRepositories().checkoutSessions.getById(readiness.session.id)?.result,
    undefined
  );
});

test("adapter reconciliation can remain pending, then complete with its captured configuration", async () => {
  resetLocalDemoState();
  const readiness = createPreparedCheckout("Config recovery shop");
  const callerConfiguration = { publicShopLabel: "Original label" };
  const configurationRepository = getLocalDemoRepositories().integrationConfigurations;
  configurationRepository.save({
    id: `integration-${readiness.order.shopId}`,
    shopId: readiness.order.shopId,
    mode: "external",
    externalReference: "shop-setting-before-initiation",
    updatedAt: new Date().toISOString(),
  });
  let initiationConfiguration: Record<string, string | undefined> | undefined;
  let reconciliationConfiguration: Record<string, string | undefined> | undefined;
  let lookups = 0;
  const adapter: CheckoutAdapter<"start"> = {
    id: "configured-recovery-adapter",
    name: "Configured recovery adapter",
    async execute(request) {
      initiationConfiguration = request.configuration;
      return {
        kind: "pending",
        externalReference: "reference-configured-1",
        diagnostics: {
          adapterId: this.id,
          adapterName: this.name,
          scenario: "start",
          message: "Adapter initiated checkout.",
          executedAt: new Date().toISOString(),
          provenance: "adapter-reported",
        },
      };
    },
    async reconcile({ request, recoveryInfo }) {
      reconciliationConfiguration = request.configuration;
      assert.equal(request.session.id, readiness.session.id);
      assert.equal(recoveryInfo.externalReference, "reference-configured-1");
      lookups += 1;
      if (lookups === 1) {
        return {
          kind: "pending",
          diagnostics: {
            adapterId: this.id,
            adapterName: this.name,
            scenario: "lookup-pending",
            message: "Still waiting for adapter outcome.",
            executedAt: new Date().toISOString(),
            provenance: "adapter-reported",
          },
        };
      }
      if (lookups === 2) throw new Error("temporary adapter lookup failure");
      return {
        kind: "completed",
        status: "succeeded",
        diagnostics: {
          adapterId: this.id,
          adapterName: this.name,
          scenario: "lookup-completed",
          message: "Adapter reports completion.",
          executedAt: new Date().toISOString(),
          provenance: "adapter-reported",
        },
      };
    },
  };
  const startedPromise = startCheckoutWithAdapter(
    readiness.session,
    adapter,
    "start",
    callerConfiguration
  );
  callerConfiguration.publicShopLabel = "Changed after start";
  const started = await startedPromise;
  assert.equal(initiationConfiguration?.publicShopLabel, "Original label");
  assert.equal(started.session.adapterConfiguration?.publicShopLabel, "Original label");
  configurationRepository.save({
    id: `integration-${readiness.order.shopId}`,
    shopId: readiness.order.shopId,
    mode: "external",
    externalReference: "shop-setting-after-initiation",
    updatedAt: new Date().toISOString(),
  });
  assert.equal(getCheckoutRecovery(readiness.session.id).kind, "pending");
  assert.throws(
    () => updateCheckoutSessionStatus(started.session, "succeeded"),
    /cannot override an adapter-bound/
  );

  const stillPending = await reconcilePendingCheckout(readiness.session.id, adapter);
  assert.equal(stillPending.kind, "pending");
  if (stillPending.kind !== "pending") return;
  assert.equal(stillPending.session.status, "pending");
  assert.equal(stillPending.session.result?.externalReference, "reference-configured-1");
  assert.equal(reconciliationConfiguration?.publicShopLabel, "Original label");

  const lookupError = await reconcilePendingCheckout(readiness.session.id, adapter);
  assert.equal(lookupError.kind, "reconciliation-error");
  if (lookupError.kind !== "reconciliation-error") return;
  assert.equal(lookupError.session.status, "pending");
  assert.equal(lookupError.session.result?.externalReference, "reference-configured-1");
  assert.equal(lookupError.session.adapterConfiguration?.publicShopLabel, "Original label");

  const completed = await reconcilePendingCheckout(readiness.session.id, adapter);
  assert.equal(completed.kind, "reconciled");
  if (completed.kind !== "reconciled") return;
  assert.equal(completed.session.result?.externalReference, "reference-configured-1");
  assert.equal(completed.session.result?.redirectUrl, undefined);
  assert.equal(
    (await reconcilePendingCheckout(readiness.session.id, adapter)).kind,
    "already-terminal"
  );
  assert.equal(lookups, 3);
});

test("reconciliation unsupported and thrown lookups remain pending without requiring a reference", async () => {
  resetLocalDemoState();
  const readiness = createPreparedCheckout("No reference recovery shop");
  let observedRecoveryReference: string | undefined = "not-called";
  let lookupMode: "unsupported" | "throw" | "complete" = "unsupported";
  const adapter: CheckoutAdapter<"start"> = {
    id: "session-id-recovery-adapter",
    name: "Session ID recovery adapter",
    async execute() {
      return {
        kind: "pending",
        diagnostics: {
          adapterId: this.id,
          adapterName: this.name,
          scenario: "start",
          message: "No external reference returned.",
          executedAt: new Date().toISOString(),
          provenance: "adapter-reported",
        },
      };
    },
    async reconcile({ request, recoveryInfo }) {
      assert.equal(request.session.id, readiness.session.id);
      observedRecoveryReference = recoveryInfo.externalReference;
      if (lookupMode === "throw") throw new Error("lookup unavailable");
      if (lookupMode === "complete") {
        return {
          kind: "completed",
          status: "succeeded",
          diagnostics: {
            adapterId: this.id,
            adapterName: this.name,
            scenario: "lookup-by-session-id",
            message: "Resolved by local session ID.",
            executedAt: new Date().toISOString(),
            provenance: "adapter-reported",
          },
        };
      }
      return {
        kind: "unsupported",
        diagnostics: {
          adapterId: this.id,
          adapterName: this.name,
          scenario: "lookup-unsupported",
          message: "No adapter lookup available.",
          executedAt: new Date().toISOString(),
          provenance: "adapter-reported",
        },
      };
    },
  };
  const started = await startCheckoutWithAdapter(readiness.session, adapter, "start");
  assert.equal(started.session.result?.externalReference, undefined);
  const unsupported = await reconcilePendingCheckout(readiness.session.id, adapter);
  assert.equal(unsupported.kind, "unsupported");
  assert.equal(observedRecoveryReference, undefined);
  assert.equal(
    getLocalDemoRepositories().checkoutSessions.getById(readiness.session.id)?.status,
    "pending"
  );

  lookupMode = "throw";
  const failedLookup = await reconcilePendingCheckout(readiness.session.id, adapter);
  assert.equal(failedLookup.kind, "reconciliation-error");
  if (failedLookup.kind === "reconciliation-error") {
    assert.match(failedLookup.message, /still pending: lookup unavailable/);
    assert.equal(failedLookup.session.status, "pending");
    assert.equal(failedLookup.session.result?.provenance, "local");
  }
  lookupMode = "complete";
  assert.equal((await reconcilePendingCheckout(readiness.session.id, adapter)).kind, "reconciled");
  assert.equal(observedRecoveryReference, undefined);
});

test("completed initiation retains an adapter reference for local order linkage", async () => {
  resetLocalDemoState();
  const readiness = createPreparedCheckout("Immediate external result shop");
  const adapter: CheckoutAdapter<"immediate"> = {
    id: "immediate-reference-adapter",
    name: "Immediate reference adapter",
    async execute() {
      return {
        kind: "completed",
        status: "succeeded",
        externalReference: "completed-reference-42",
        diagnostics: {
          adapterId: this.id,
          adapterName: this.name,
          scenario: "immediate",
          message: "Adapter reports completed checkout.",
          executedAt: new Date().toISOString(),
          provenance: "adapter-reported",
        },
      };
    },
  };
  const result = await startCheckoutWithAdapter(readiness.session, adapter, "immediate");
  assert.equal(result.session.status, "succeeded");
  assert.equal(result.session.result?.externalReference, "completed-reference-42");
  assert.equal(result.session.result?.redirectUrl, undefined);
});

for (const outcome of ["resolve", "reject"] as const) {
  test(`late initiation ${outcome} cannot overwrite reconciliation`, async () => {
    resetLocalDemoState();
    const readiness = createPreparedCheckout(`Late ${outcome} shop`);
    let resolveExecution: ((result: CheckoutResult) => void) | undefined;
    let rejectExecution: ((error: Error) => void) | undefined;
    const adapter: CheckoutAdapter<"deferred"> = {
      id: `late-${outcome}-adapter`,
      name: `Late ${outcome} adapter`,
      execute() {
        return new Promise((resolve, reject) => {
          resolveExecution = resolve;
          rejectExecution = reject;
        });
      },
      async reconcile() {
        return {
          kind: "completed",
          status: "succeeded",
          diagnostics: {
            adapterId: this.id,
            adapterName: this.name,
            scenario: "reconciled-before-initiation-response",
            message: "Adapter reconciliation completed first.",
            executedAt: new Date().toISOString(),
            provenance: "adapter-reported",
          },
        };
      },
    };
    const initiation = startCheckoutWithAdapter(readiness.session, adapter, "deferred");
    const terminal = await reconcilePendingCheckout(readiness.session.id, adapter);
    assert.equal(terminal.kind, "reconciled");
    if (outcome === "resolve") {
      resolveExecution?.({
        kind: "pending",
        externalReference: "late-ref",
        redirectUrl: "https://late.example.test/checkout",
        diagnostics: {
          adapterId: adapter.id,
          adapterName: adapter.name,
          scenario: "late-initiation",
          message: "Late pending initiation result.",
          executedAt: new Date().toISOString(),
          provenance: "adapter-reported",
        },
      });
    } else {
      rejectExecution?.(new Error("Late initiation rejected after reconciliation."));
    }
    const lateExecution = await initiation;
    assert.equal(lateExecution.session.status, "succeeded");
    assert.equal(lateExecution.order.status, "completed");
    assert.equal(lateExecution.session.result?.scenario, "reconciled-before-initiation-response");
    assert.equal(lateExecution.session.result?.redirectUrl, undefined);
  });
}

test("concurrent reconciliation preserves the first terminal result", async () => {
  resetLocalDemoState();
  const readiness = createPreparedCheckout("Concurrent reconciliation shop");
  const resolvers: Array<(result: CheckoutResult) => void> = [];
  const adapter: CheckoutAdapter<"concurrent"> = {
    id: "concurrent-reconciliation-adapter",
    name: "Concurrent reconciliation adapter",
    async execute() {
      return {
        kind: "pending",
        externalReference: "concurrent-reference",
        diagnostics: {
          adapterId: this.id,
          adapterName: this.name,
          scenario: "start",
          message: "Pending",
          executedAt: new Date().toISOString(),
          provenance: "adapter-reported",
        },
      };
    },
    reconcile() {
      return new Promise((resolve) => resolvers.push(resolve));
    },
  };
  await startCheckoutWithAdapter(readiness.session, adapter, "concurrent");
  const first = reconcilePendingCheckout(readiness.session.id, adapter);
  const second = reconcilePendingCheckout(readiness.session.id, adapter);
  const makeResult = (status: "succeeded" | "failed"): CheckoutResult => ({
    kind: "completed",
    status,
    diagnostics: {
      adapterId: adapter.id,
      adapterName: adapter.name,
      scenario: `concurrent-${status}`,
      message: `Adapter reports ${status}.`,
      executedAt: new Date().toISOString(),
      provenance: "adapter-reported",
    },
  });
  resolvers[0]?.(makeResult("succeeded"));
  const firstResult = await first;
  assert.equal(firstResult.kind, "reconciled");
  resolvers[1]?.(makeResult("failed"));
  const secondResult = await second;
  assert.equal(secondResult.kind, "already-terminal");
  assert.equal(
    getLocalDemoRepositories().checkoutSessions.getById(readiness.session.id)?.status,
    "succeeded"
  );
});

test("manual demo statuses are simulated and cannot override bound or stale attempts", () => {
  resetLocalDemoState();
  const readiness = createPreparedCheckout("Manual status shop");
  assert.equal(getCheckoutRecovery(readiness.session.id).kind, "not-started");
  const manuallyPending = updateCheckoutSessionStatus(readiness.session, "pending");
  assert.equal(manuallyPending.adapterId, "manual-demo-status");
  assert.equal(manuallyPending.result?.provenance, "simulated");
  assert.equal(getCheckoutRecovery(readiness.session.id).kind, "pending");
  const manuallyCompleted = updateCheckoutSessionStatus(manuallyPending, "succeeded");
  assert.equal(manuallyCompleted.result?.scenario, "manual-status-demo");
  assert.throws(
    () => updateCheckoutSessionStatus(readiness.session, "pending"),
    /changed; refresh/
  );
});
