import { createCheckoutSessionForOrder } from "../../src/domain/checkout";
import { createCustomer } from "../../src/domain/customer";
import { createOrder } from "../../src/domain/order";
import { createMoney } from "../../src/domain/shared";

export function createTestOrder() {
  return createOrder({
    id: "test-order",
    shopId: "test-shop",
    customerId: "test-customer",
    createdAt: "2026-01-01T00:00:00.000Z",
    items: [
      {
        productId: "test-product",
        productName: "Test product",
        quantity: 2,
        unitPrice: createMoney(10, "USD"),
        lineTotal: createMoney(20, "USD"),
      },
    ],
    total: createMoney(20, "USD"),
  });
}

export function createTestCheckoutRequest() {
  const order = createTestOrder();

  return {
    order,
    session: createCheckoutSessionForOrder("test-session", order),
  };
}

export function createTestCustomer() {
  return createCustomer({
    id: "test-customer",
    name: "Test Customer",
    email: "customer@example.test",
    country: "US",
  });
}
