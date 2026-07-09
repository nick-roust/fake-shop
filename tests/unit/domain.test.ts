import assert from "node:assert/strict";
import test from "node:test";

import {
  createCart,
  createCartItem,
  getCartItemLineTotal,
  getCartTotal,
} from "../../src/domain/cart";
import {
  canTransitionCheckoutSession,
  createCheckoutSession,
  transitionCheckoutSessionStatus,
} from "../../src/domain/checkout";
import { createOrderFromCart, getOrderTotal } from "../../src/domain/order";
import { createMoney } from "../../src/domain/shared";
import { createTestCustomer } from "../helpers/domain-fixtures";

test("cart calculations are deterministic", () => {
  const cart = createCart({
    id: "cart-1",
    shopId: "shop-1",
    currency: "USD",
    items: [
      createCartItem({
        productId: "product-1",
        productName: "Notebook",
        quantity: 2,
        unitPrice: createMoney(12.5, "USD"),
      }),
      createCartItem({
        productId: "product-2",
        productName: "Mug",
        quantity: 1,
        unitPrice: createMoney(18, "USD"),
      }),
    ],
  });

  assert.deepEqual(getCartItemLineTotal(cart.items[0]), createMoney(25, "USD"));
  assert.deepEqual(getCartTotal(cart), createMoney(43, "USD"));
});

test("order total follows order item snapshots", () => {
  const cart = createCart({
    id: "cart-1",
    shopId: "shop-1",
    currency: "USD",
    items: [
      createCartItem({
        productId: "product-1",
        productName: "Notebook",
        quantity: 3,
        unitPrice: createMoney(10, "USD"),
      }),
    ],
  });
  const order = createOrderFromCart({
    id: "order-1",
    cart,
    customer: createTestCustomer(),
  });

  assert.equal(order.status, "created");
  assert.deepEqual(order.total, createMoney(30, "USD"));
  assert.deepEqual(getOrderTotal(order), createMoney(30, "USD"));
});

test("checkout session lifecycle accepts approved transitions", () => {
  const created = createCheckoutSession({
    id: "session-1",
    orderId: "order-1",
  });
  const pending = transitionCheckoutSessionStatus(created, "pending");
  const succeeded = transitionCheckoutSessionStatus(pending, "succeeded", {
    adapterName: "Mock checkout",
    message: "Completed",
  });

  assert.equal(canTransitionCheckoutSession("created", "pending"), true);
  assert.equal(canTransitionCheckoutSession("pending", "succeeded"), true);
  assert.equal(succeeded.status, "succeeded");
  assert.equal(succeeded.result?.adapterName, "Mock checkout");
});

test("checkout session lifecycle rejects invalid transitions", () => {
  const created = createCheckoutSession({
    id: "session-1",
    orderId: "order-1",
  });

  assert.equal(canTransitionCheckoutSession("created", "succeeded"), false);
  assert.throws(
    () => transitionCheckoutSessionStatus(created, "succeeded"),
    /Invalid checkout session status transition/
  );
});
