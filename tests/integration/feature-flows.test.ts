import assert from "node:assert/strict";
import test from "node:test";

import {
  addProductToCart,
  prepareCheckout,
  runMockCheckout,
} from "../../src/features/checkout/checkout-service";
import {
  createManagedProduct,
  getProductCatalog,
} from "../../src/features/products/product-service";
import { createManagedShop, listShops } from "../../src/features/shops/shop-service";
import { listShopOrders } from "../../src/features/orders/order-service";
import { resetLocalDemoState } from "../../src/storage/local-demo-boundary";

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

test("mock checkout result is visible through order management", () => {
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
  const execution = runMockCheckout(readiness.session, "success");
  const orders = listShopOrders(shop.id);

  assert.equal(execution.status, "succeeded");
  assert.equal(execution.order.status, "completed");
  assert.equal(orders.length, 1);
  assert.equal(orders[0]?.session?.status, "succeeded");
});
