"use client";

import {
  createCart,
  createCartItemFromProduct,
  getCartTotal,
  type Cart,
  type CartItem,
} from "@/domain/cart";
import {
  createCheckoutSession,
  createCheckoutSessionForOrder,
  transitionCheckoutSessionStatus,
  type CheckoutSession,
  type CheckoutAdapterConfiguration,
  type CheckoutSessionResultInfo,
  type CheckoutSessionStatus,
} from "@/domain/checkout";
import { createCustomer, type Customer } from "@/domain/customer";
import { createOrder, createOrderFromCart, type Order, type OrderStatus } from "@/domain/order";
import { type Product } from "@/domain/product";
import { createShop, type Shop } from "@/domain/shop";
import {
  type CheckoutAdapter,
  type CheckoutDiagnostics,
  type CheckoutResult,
  externalCheckoutAdapter,
  mockCheckoutAdapter,
  simulatedRedirectCheckoutAdapter,
  type ExternalCheckoutScenario,
  type MockCheckoutScenario,
} from "@/integrations/checkout";
import { isSafeCheckoutRedirect } from "@/integrations/checkout/adapter";
import { getLocalDemoRepositories } from "@/storage/local-demo-boundary";
import { type IntegrationConfiguration } from "@/storage/types";

import { type CustomerFormValues } from "./customer-form";

export type CheckoutPreparation = {
  cart?: Cart;
  customer?: Customer;
  integrationConfiguration?: IntegrationConfiguration;
  order?: Order;
  products: Product[];
  session?: CheckoutSession;
  shop?: Shop;
};

export type CheckoutReadiness = {
  cart: Cart;
  customer: Customer;
  order: Order;
  ready: boolean;
  session: CheckoutSession;
  total: string;
};

export type MockCheckoutExecution = {
  adapterId: string;
  adapterName: string;
  executedAt: string;
  message: string;
  order: Order;
  scenario: MockCheckoutScenario;
  session: CheckoutSession;
  status: CheckoutSession["status"];
};

export type CheckoutStartExecution = {
  adapterId: string;
  adapterName: string;
  message: string;
  order: Order;
  redirectUrl?: string;
  session: CheckoutSession;
  status: CheckoutSession["status"];
};

export type CheckoutRecoveryState =
  | { kind: "reconciled"; order: Order; session: CheckoutSession }
  | { kind: "not-started"; order: Order; session: CheckoutSession }
  | { kind: "pending"; order: Order; session: CheckoutSession; message: string }
  | { kind: "reconciliation-error"; order: Order; session: CheckoutSession; message: string }
  | { kind: "already-terminal"; order: Order; session: CheckoutSession }
  | { kind: "missing-session" }
  | { kind: "missing-order" }
  | { kind: "missing-adapter-binding" }
  | { kind: "wrong-adapter-binding" }
  | { kind: "unsupported"; order: Order; session: CheckoutSession; message: string };

const activeCheckoutAttempts = new Set<string>();
const manualDemoAdapterId = "manual-demo-status";

export type ExternalCheckoutExecution = {
  adapterId: string;
  adapterName: string;
  configurationReady: boolean;
  executedAt: string;
  message: string;
  mode: "external";
  order: Order;
  scenario: ExternalCheckoutScenario;
  session: CheckoutSession;
  status: CheckoutSession["status"];
};

export function getCheckoutPreparation(shopId: string): CheckoutPreparation {
  const repositories = getLocalDemoRepositories();

  return {
    shop: repositories.shops.getById(shopId),
    products: repositories.products
      .list()
      .filter((product) => product.shopId === shopId && product.active),
    cart: findCartForShop(shopId),
    customer: repositories.customers.list().at(-1),
    integrationConfiguration: findIntegrationConfigurationForShop(shopId),
    order: findLatestOrderForShop(shopId),
    session: findLatestCheckoutSessionForShop(shopId),
  };
}

export function addProductToCart(shop: Shop, product: Product): Cart {
  const cart = getOrCreateCart(shop.id, product.price.currency);
  const existingItem = cart.items.find((item) => item.productId === product.id);
  const nextItems = existingItem
    ? cart.items.map((item) =>
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      )
    : [...cart.items, createCartItemFromProduct(product, 1)];

  return saveCart({ ...cart, items: nextItems });
}

export function updateCartItemQuantity(cart: Cart, productId: string, quantity: number): Cart {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return removeCartItem(cart, productId);
  }

  return saveCart({
    ...cart,
    items: cart.items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
  });
}

export function removeCartItem(cart: Cart, productId: string): Cart {
  return saveCart({
    ...cart,
    items: cart.items.filter((item) => item.productId !== productId),
  });
}

export function prepareCheckout(cart: Cart, values: CustomerFormValues): CheckoutReadiness {
  if (cart.items.length === 0) {
    throw new Error("Cart must contain at least one product.");
  }

  const repositories = getLocalDemoRepositories();
  const customer = repositories.customers.save(
    createCustomer({
      id: createEntityId("customer"),
      name: `${values.firstName.trim()} ${values.lastName.trim()}`,
      email: values.email,
      phone: values.phone,
      country: values.country,
      address: {
        line1: values.addressLine1,
        line2: values.addressLine2,
        city: values.city,
        region: values.region,
        postalCode: values.postalCode,
        country: values.country,
      },
    })
  );
  const order = repositories.orders.save(
    createOrderFromCart({
      id: createEntityId("order"),
      cart,
      customer,
      status: "created",
    })
  );
  const session = repositories.checkoutSessions.save(
    createCheckoutSessionForOrder(createEntityId("checkout-session"), order)
  );
  const shop = repositories.shops.getById(order.shopId);

  if (shop) {
    repositories.shops.save(
      createShop({
        ...shop,
        orderIds: Array.from(new Set([...shop.orderIds, order.id])),
      })
    );
  }

  return {
    cart,
    customer,
    order,
    ready: true,
    session,
    total: getCartTotal(cart).amount.toFixed(2),
  };
}

export function updateCheckoutSessionStatus(
  session: CheckoutSession,
  nextStatus: CheckoutSessionStatus,
  result?: CheckoutSessionResultInfo
): CheckoutSession {
  const repository = getLocalDemoRepositories().checkoutSessions;
  const current = repository.getById(session.id);
  if (!current || current.orderId !== session.orderId) {
    throw new Error("Checkout session is unavailable or has changed.");
  }
  if (current.status !== session.status) {
    throw new Error("Checkout session changed; refresh before applying a manual demo status.");
  }
  if (current.status === "pending" && current.adapterId !== manualDemoAdapterId) {
    throw new Error("Manual demo status cannot override an adapter-bound pending attempt.");
  }
  const boundSession =
    current.status === "created" && nextStatus === "pending"
      ? createCheckoutSession({ ...current, adapterId: manualDemoAdapterId })
      : current;
  return repository.save(
    transitionCheckoutSessionStatus(boundSession, nextStatus, {
      adapterId: manualDemoAdapterId,
      adapterName: "Manual demo status",
      message: result?.message ?? `Manually simulated status ${nextStatus}.`,
      provenance: "simulated",
      recordedAt: result?.recordedAt ?? new Date().toISOString(),
      scenario: "manual-status-demo",
    })
  );
}

export async function runMockCheckout(
  session: CheckoutSession,
  scenario: MockCheckoutScenario
): Promise<MockCheckoutExecution> {
  const execution = await startCheckoutWithAdapter(session, mockCheckoutAdapter, scenario);
  if (execution.session.status === "pending") {
    throw new Error("Mock checkout adapter unexpectedly returned a pending result.");
  }
  return {
    adapterId: execution.adapterId,
    adapterName: execution.adapterName,
    executedAt: execution.session.result?.recordedAt ?? new Date().toISOString(),
    message: execution.message,
    order: execution.order,
    scenario,
    session: execution.session,
    status: execution.session.status,
  };
}

export async function startSimulatedRedirectCheckout(
  session: CheckoutSession
): Promise<CheckoutStartExecution> {
  return startCheckoutWithAdapter(session, simulatedRedirectCheckoutAdapter, "delayed-success");
}

export async function startCheckoutWithAdapter<TScenario extends string>(
  session: CheckoutSession,
  adapter: CheckoutAdapter<TScenario>,
  scenario: TScenario,
  configuration?: CheckoutAdapterConfiguration
): Promise<CheckoutStartExecution> {
  if (activeCheckoutAttempts.has(session.id)) {
    throw new Error("Checkout initiation is already in progress for this session.");
  }
  activeCheckoutAttempts.add(session.id);
  try {
    const repositories = getLocalDemoRepositories();
    const persistedSession = repositories.checkoutSessions.getById(session.id);
    if (!persistedSession) throw new Error("Checkout session was not found in local storage.");
    if (persistedSession.orderId !== session.orderId)
      throw new Error("Checkout session binding changed.");
    const order = repositories.orders.getById(persistedSession.orderId);
    if (!order) throw new Error("Related order is required before running checkout.");
    if (persistedSession.status !== "created")
      throw new Error("Checkout session is not ready to start.");
    if (adapter.supportsInitiation === false)
      throw new Error("This checkout adapter is unsupported.");

    const adapterConfiguration = configuration ? { ...configuration } : undefined;
    const boundSession = createCheckoutSession({
      ...persistedSession,
      adapterId: adapter.id,
      adapterConfiguration,
    });
    const pendingSession = repositories.checkoutSessions.save(
      transitionCheckoutSessionStatus(boundSession, "pending", {
        adapterId: adapter.id,
        adapterName: adapter.name,
        message: "Checkout initiation started.",
        provenance: "local",
        recordedAt: new Date().toISOString(),
        scenario,
      })
    );
    const pendingOrder = repositories.orders.save(updateOrderStatus(order, "pending"));
    let result: CheckoutResult | undefined;
    let initiationError: string | undefined;
    try {
      result = await adapter.execute(
        {
          configuration: adapterConfiguration,
          order: pendingOrder,
          session: pendingSession,
        },
        scenario
      );
    } catch (error) {
      initiationError = error instanceof Error ? error.message : "Unknown adapter error.";
    }

    // The attempt may have been reconciled or changed while the adapter was awaiting I/O.
    const latestSession = repositories.checkoutSessions.getById(session.id);
    if (!latestSession) throw new Error("Checkout session disappeared during initiation.");
    const latestOrder = repositories.orders.getById(latestSession.orderId);
    if (!latestOrder) throw new Error("Related order disappeared during initiation.");
    if (
      latestSession.orderId !== pendingSession.orderId ||
      latestSession.adapterId !== adapter.id ||
      JSON.stringify(latestSession.adapterConfiguration) !==
        JSON.stringify(pendingSession.adapterConfiguration)
    ) {
      return {
        adapterId: adapter.id,
        adapterName: adapter.name,
        message: "Checkout binding changed during initiation; the late adapter result was ignored.",
        order: latestOrder,
        session: latestSession,
        status: latestSession.status,
      };
    }
    if (latestSession.status !== "pending" || latestOrder.status !== "pending") {
      return {
        adapterId: adapter.id,
        adapterName: adapter.name,
        message:
          "Checkout changed while initiation was in progress; the late adapter result was ignored.",
        order: latestOrder,
        session: latestSession,
        status: latestSession.status,
      };
    }
    if (initiationError) {
      const message = `Initiation outcome is unknown: ${initiationError}`;
      const recoverableSession = repositories.checkoutSessions.save(
        createCheckoutSession({
          ...latestSession,
          result: {
            ...latestSession.result,
            adapterId: adapter.id,
            adapterName: adapter.name,
            message,
            provenance: "local",
            recordedAt: new Date().toISOString(),
          },
        })
      );
      return {
        adapterId: adapter.id,
        adapterName: adapter.name,
        message,
        order: latestOrder,
        session: recoverableSession,
        status: "pending",
      };
    }
    if (!result) throw new Error("Adapter returned no initiation result.");
    if (result.kind === "unsupported") {
      const createdSession = repositories.checkoutSessions.save(
        createCheckoutSession({
          ...latestSession,
          result: diagnosticsToResultInfo(result.diagnostics, result, latestSession.result),
        })
      );
      return {
        adapterId: adapter.id,
        adapterName: adapter.name,
        message: result.diagnostics.message,
        order: latestOrder,
        session: createdSession,
        status: "pending",
      };
    }
    const info = diagnosticsToResultInfo(result.diagnostics, result, latestSession.result);
    if (result.kind === "pending") {
      const updatedSession = repositories.checkoutSessions.save(
        createCheckoutSession({
          ...latestSession,
          result: info,
        })
      );
      return {
        adapterId: adapter.id,
        adapterName: adapter.name,
        message: result.diagnostics.message,
        order: latestOrder,
        redirectUrl: info.redirectUrl,
        session: updatedSession,
        status: "pending",
      };
    }
    const completedSession = repositories.checkoutSessions.save(
      transitionCheckoutSessionStatus(latestSession, result.status, info)
    );
    const completedOrder = repositories.orders.save(
      updateOrderStatus(latestOrder, mapResultToOrderStatus(result.status))
    );
    return {
      adapterId: adapter.id,
      adapterName: adapter.name,
      message: result.diagnostics.message,
      order: completedOrder,
      session: completedSession,
      status: completedSession.status,
    };
  } finally {
    activeCheckoutAttempts.delete(session.id);
  }
}

export function getCheckoutRecovery(sessionId: string): CheckoutRecoveryState {
  const repositories = getLocalDemoRepositories();
  const session = repositories.checkoutSessions.getById(sessionId);
  if (!session) return { kind: "missing-session" };
  const order = repositories.orders.getById(session.orderId);
  if (!order) return { kind: "missing-order" };
  if (session.status === "created") return { kind: "not-started", order, session };
  if (session.status !== "pending") return { kind: "already-terminal", order, session };
  return {
    kind: "pending",
    order,
    session,
    message: session.adapterId
      ? "Checkout remains pending. The browser return does not confirm an outcome."
      : "Checkout remains pending without an adapter binding. The browser return does not confirm an outcome.",
  };
}

export async function simulateCheckoutReturn(sessionId: string): Promise<CheckoutRecoveryState> {
  return reconcilePendingCheckout(sessionId, simulatedRedirectCheckoutAdapter);
}

export async function reconcilePendingCheckout<TScenario extends string>(
  sessionId: string,
  adapter: CheckoutAdapter<TScenario>
): Promise<CheckoutRecoveryState> {
  const repositories = getLocalDemoRepositories();
  const session = repositories.checkoutSessions.getById(sessionId);
  if (!session) return { kind: "missing-session" };
  const order = repositories.orders.getById(session.orderId);
  if (!order) return { kind: "missing-order" };
  if (session.status === "created") return { kind: "not-started", order, session };
  if (session.status !== "pending") return { kind: "already-terminal", order, session };
  if (!session.adapterId) return { kind: "missing-adapter-binding" };
  if (session.adapterId !== adapter.id) return { kind: "wrong-adapter-binding" };
  const request = { order, session, configuration: session.adapterConfiguration };
  let result: CheckoutResult | undefined;
  let reconciliationError: string | undefined;
  try {
    result = await adapter.reconcile?.({
      request,
      recoveryInfo: {
        externalReference: session.result?.externalReference,
        scenario: session.result?.scenario,
      },
    });
  } catch (error) {
    reconciliationError = error instanceof Error ? error.message : "Unknown adapter error.";
  }

  // Re-read after awaiting, regardless of success or exception. Late lookups must never
  // replace a terminal/manual result or a changed adapter/order binding.
  const latest = repositories.checkoutSessions.getById(sessionId);
  if (!latest) return { kind: "missing-session" };
  const latestOrder = repositories.orders.getById(latest.orderId);
  if (!latestOrder) return { kind: "missing-order" };
  if (latest.orderId !== session.orderId || latest.adapterId !== adapter.id) {
    return { kind: "wrong-adapter-binding" };
  }
  if (
    JSON.stringify(latest.adapterConfiguration) !== JSON.stringify(session.adapterConfiguration)
  ) {
    return { kind: "wrong-adapter-binding" };
  }
  if (latest.status === "created")
    return { kind: "not-started", order: latestOrder, session: latest };
  if (latest.status !== "pending") {
    return { kind: "already-terminal", order: latestOrder, session: latest };
  }
  if (latestOrder.status !== "pending") {
    return {
      kind: "pending",
      order: latestOrder,
      session: latest,
      message: "Session remains pending, but the related order changed during reconciliation.",
    };
  }
  if (reconciliationError) {
    const message = `Reconciliation is still pending: ${reconciliationError}`;
    const recoverable = repositories.checkoutSessions.save(
      createCheckoutSession({
        ...latest,
        result: {
          ...latest.result,
          adapterId: adapter.id,
          adapterName: adapter.name,
          message,
          provenance: "local",
          recordedAt: new Date().toISOString(),
          scenario: "return-reconciliation",
        },
      })
    );
    return { kind: "reconciliation-error", order: latestOrder, session: recoverable, message };
  }
  if (!result)
    return {
      kind: "unsupported",
      order: latestOrder,
      session: latest,
      message: "Adapter reconciliation is unsupported.",
    };
  if (result.diagnostics.adapterId !== session.adapterId) {
    return {
      kind: "wrong-adapter-binding",
    };
  }
  if (result.kind === "unsupported") {
    const message = result.diagnostics.message;
    const updated = repositories.checkoutSessions.save(
      createCheckoutSession({
        ...latest,
        result: diagnosticsToResultInfo(result.diagnostics, result, latest.result),
      })
    );
    return { kind: "unsupported", order: latestOrder, session: updated, message };
  }
  if (result.kind === "pending") {
    const updated = repositories.checkoutSessions.save(
      createCheckoutSession({
        ...latest,
        result: diagnosticsToResultInfo(result.diagnostics, result, latest.result),
      })
    );
    return {
      kind: "pending",
      order: latestOrder,
      session: updated,
      message: result.diagnostics.message,
    };
  }
  const completedSession = repositories.checkoutSessions.save(
    transitionCheckoutSessionStatus(
      latest,
      result.status,
      diagnosticsToResultInfo(result.diagnostics, result, latest.result)
    )
  );
  const completedOrder = repositories.orders.save(
    updateOrderStatus(latestOrder, mapResultToOrderStatus(result.status))
  );
  return { kind: "reconciled", order: completedOrder, session: completedSession };
}

function diagnosticsToResultInfo(
  diagnostics: CheckoutDiagnostics,
  result?: CheckoutResult,
  previous?: CheckoutSessionResultInfo
) {
  const nextExternalReference =
    result?.kind === "pending" || result?.kind === "completed"
      ? result.externalReference
      : undefined;
  const redirectUrl = result?.kind === "pending" ? result.redirectUrl : undefined;
  return {
    adapterId: diagnostics.adapterId,
    adapterName: diagnostics.adapterName,
    externalReference: nextExternalReference ?? previous?.externalReference,
    message: diagnostics.message,
    provenance: diagnostics.provenance,
    redirectUrl: isSafeCheckoutRedirect(redirectUrl) ? redirectUrl : undefined,
    recordedAt: diagnostics.executedAt,
    scenario: diagnostics.scenario,
  };
}

export function runExternalCheckoutBoundary(session: CheckoutSession): ExternalCheckoutExecution {
  const repositories = getLocalDemoRepositories();
  const order = repositories.orders.getById(session.orderId);
  if (!order) {
    throw new Error("Related order is required before checking external support.");
  }
  const configuration = findIntegrationConfigurationForShop(order.shopId);
  if (configuration?.mode !== "external") {
    throw new Error("External mode must be selected before checking external support.");
  }
  return {
    adapterId: externalCheckoutAdapter.id,
    adapterName: externalCheckoutAdapter.name,
    configurationReady: Boolean(configuration.externalBaseUrl && configuration.externalReference),
    executedAt: new Date().toISOString(),
    message: "External checkout is unsupported and was not executed.",
    mode: "external",
    order,
    scenario: "boundary-check",
    session,
    status: session.status,
  };
}

function getOrCreateCart(shopId: string, currency: string): Cart {
  const existingCart = findCartForShop(shopId);

  if (existingCart) {
    if (existingCart.items.length === 0 && existingCart.currency !== currency) {
      return saveCart({ ...existingCart, currency });
    }

    ensureCartCurrency(existingCart, currency);
    return existingCart;
  }

  return saveCart(
    createCart({
      id: createEntityId("cart"),
      shopId,
      currency,
    })
  );
}

function findCartForShop(shopId: string): Cart | undefined {
  return getLocalDemoRepositories()
    .carts.list()
    .find((cart) => cart.shopId === shopId);
}

function findLatestOrderForShop(shopId: string): Order | undefined {
  return getLocalDemoRepositories()
    .orders.list()
    .filter((order) => order.shopId === shopId)
    .at(-1);
}

function findLatestCheckoutSessionForShop(shopId: string): CheckoutSession | undefined {
  const latestOrder = findLatestOrderForShop(shopId);

  if (!latestOrder) {
    return undefined;
  }

  return getLocalDemoRepositories()
    .checkoutSessions.list()
    .filter((session) => session.orderId === latestOrder.id)
    .at(-1);
}

function findIntegrationConfigurationForShop(shopId: string): IntegrationConfiguration | undefined {
  return getLocalDemoRepositories()
    .integrationConfigurations.list()
    .find((configuration) => configuration.shopId === shopId);
}

function saveCart(cart: Cart): Cart {
  return getLocalDemoRepositories().carts.save(createCart(cart));
}

function updateOrderStatus(order: Order, status: OrderStatus): Order {
  return createOrder({
    ...order,
    status,
  });
}

function mapResultToOrderStatus(status: CheckoutSession["status"]): OrderStatus {
  if (status === "succeeded") {
    return "completed";
  }

  if (status === "cancelled") {
    return "cancelled";
  }

  return "pending";
}

function ensureCartCurrency(cart: Cart, currency: string): void {
  if (cart.items.length > 0 && cart.currency !== currency) {
    throw new Error("Cart can contain products with one currency.");
  }
}

function createEntityId(prefix: string): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${prefix}-${Date.now().toString(36)}`;
}

export function getCartItem(cart: Cart, productId: string): CartItem | undefined {
  return cart.items.find((item) => item.productId === productId);
}
