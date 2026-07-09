import assert from "node:assert/strict";
import test from "node:test";

import {
  addProductToCart,
  prepareCheckout,
  runMockCheckout,
} from "../../src/features/checkout/checkout-service";
import { createManagedProduct } from "../../src/features/products/product-service";
import { createManagedShop } from "../../src/features/shops/shop-service";
import { getOrderRecord, listShopOrders } from "../../src/features/orders/order-service";
import { resetLocalDemoState } from "../../src/storage/local-demo-boundary";

test("main demo journey reaches order details after mock checkout", () => {
  resetLocalDemoState();

  const shop = createManagedShop({
    category: "Reference demo",
    description: "End-to-end demo shop",
    displayName: "Journey Shop",
    accentColor: "#2563eb",
    name: "Journey Shop",
    scenario: "Mock checkout",
  });
  const product = createManagedProduct(shop, {
    active: true,
    categoryName: "Demo items",
    currency: "USD",
    description: "End-to-end demo item",
    name: "Journey Notebook",
    price: "15",
  });
  const cart = addProductToCart(shop, product);
  const readiness = prepareCheckout(cart, {
    addressLine1: "100 Journey Street",
    addressLine2: "",
    city: "Demo City",
    country: "US",
    email: "journey@example.test",
    firstName: "Journey",
    lastName: "Buyer",
    phone: "",
    postalCode: "90000",
    region: "CA",
  });
  const execution = runMockCheckout(readiness.session, "success");
  const orderRecord = getOrderRecord(execution.order.id, shop.id);
  const orders = listShopOrders(shop.id);

  assert.equal(cart.items.length, 1);
  assert.equal(readiness.session.status, "created");
  assert.equal(execution.session.status, "succeeded");
  assert.equal(execution.order.status, "completed");
  assert.equal(orders.length, 1);
  assert.equal(orderRecord?.order.id, execution.order.id);
  assert.equal(orderRecord?.session?.result?.adapterName, "Mock checkout");
});
