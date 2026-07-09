"use client";

import {
  createCart,
  createCartItemFromProduct,
  getCartTotal,
  type Cart,
  type CartItem,
} from "@/domain/cart";
import {
  createCheckoutSessionForOrder,
  transitionCheckoutSessionStatus,
  type CheckoutSession,
  type CheckoutSessionResultInfo,
  type CheckoutSessionStatus,
} from "@/domain/checkout";
import { createCustomer, type Customer } from "@/domain/customer";
import { createOrder, createOrderFromCart, type Order, type OrderStatus } from "@/domain/order";
import { type Product } from "@/domain/product";
import { createShop, type Shop } from "@/domain/shop";
import { mockCheckoutAdapter, type MockCheckoutScenario } from "@/integrations/checkout";
import { getLocalDemoRepositories } from "@/storage/local-demo-boundary";

import { type CustomerFormValues } from "./customer-form";

export type CheckoutPreparation = {
  cart?: Cart;
  customer?: Customer;
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

export function getCheckoutPreparation(shopId: string): CheckoutPreparation {
  const repositories = getLocalDemoRepositories();

  return {
    shop: repositories.shops.getById(shopId),
    products: repositories.products
      .list()
      .filter((product) => product.shopId === shopId && product.active),
    cart: findCartForShop(shopId),
    customer: repositories.customers.list().at(-1),
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
  return getLocalDemoRepositories().checkoutSessions.save(
    transitionCheckoutSessionStatus(session, nextStatus, result)
  );
}

export function runMockCheckout(
  session: CheckoutSession,
  scenario: MockCheckoutScenario
): MockCheckoutExecution {
  const repositories = getLocalDemoRepositories();
  const order = repositories.orders.getById(session.orderId);

  if (!order) {
    throw new Error("Related order is required before running mock checkout.");
  }

  const pendingSession = repositories.checkoutSessions.save(
    transitionCheckoutSessionStatus(session, "pending", {
      message: "Mock checkout started.",
      recordedAt: new Date().toISOString(),
    })
  );
  const pendingOrder = repositories.orders.save(updateOrderStatus(order, "pending"));
  const result = mockCheckoutAdapter.execute(
    {
      order: pendingOrder,
      session: pendingSession,
    },
    scenario
  );
  const completedSession = repositories.checkoutSessions.save(
    transitionCheckoutSessionStatus(pendingSession, result.status, {
      adapterId: result.diagnostics.adapterId,
      adapterName: result.diagnostics.adapterName,
      message: result.diagnostics.message,
      recordedAt: result.diagnostics.executedAt,
      scenario: result.diagnostics.scenario,
    })
  );
  const completedOrder = repositories.orders.save(
    updateOrderStatus(pendingOrder, mapResultToOrderStatus(result.status))
  );

  return {
    adapterId: result.diagnostics.adapterId,
    adapterName: result.diagnostics.adapterName,
    executedAt: result.diagnostics.executedAt,
    message: result.diagnostics.message,
    order: completedOrder,
    scenario,
    session: completedSession,
    status: completedSession.status,
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
