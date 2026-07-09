import { createCart, createCartItemFromProduct } from "@/domain/cart";
import { createCheckoutSession } from "@/domain/checkout";
import { createCustomer } from "@/domain/customer";
import { createOrder } from "@/domain/order";
import { createCategory, createProduct } from "@/domain/product";
import { createMoney } from "@/domain/shared";
import { createShop } from "@/domain/shop";

import { type FakeShopSeed } from "./types";

const demoCreatedAt = "2026-01-01T10:00:00.000Z";
const demoCompletedAt = "2026-01-01T10:02:00.000Z";
const demoFailedAt = "2026-01-01T10:05:00.000Z";
const demoCancelledAt = "2026-01-01T10:08:00.000Z";

const marketShop = createShop({
  id: "sample-market",
  name: "Sample Market",
  description: "Demo storefront for local catalog, cart, and mock checkout flows.",
  category: "Retail demo",
  scenario: "Mock checkout",
  displaySettings: {
    displayName: "Sample Market",
    accentColor: "#2563eb",
  },
  productIds: ["sample-product-notebook", "sample-product-mug", "sample-product-tote"],
  orderIds: ["sample-order-success", "sample-order-failure", "sample-order-cancelled"],
});

const servicesShop = createShop({
  id: "sample-services",
  name: "Sample Services",
  description: "Demo storefront for service-style catalog examples.",
  category: "Services demo",
  scenario: "Catalog browsing",
  displaySettings: {
    displayName: "Sample Services",
    accentColor: "#059669",
  },
  productIds: ["sample-product-consulting"],
  orderIds: [],
});

const stationeryCategory = createCategory({
  id: "sample-category-stationery",
  shopId: marketShop.id,
  name: "Stationery",
});

const accessoriesCategory = createCategory({
  id: "sample-category-accessories",
  shopId: marketShop.id,
  name: "Accessories",
});

const servicesCategory = createCategory({
  id: "sample-category-services",
  shopId: servicesShop.id,
  name: "Services",
});

const notebookProduct = createProduct({
  id: "sample-product-notebook",
  shopId: marketShop.id,
  name: "Demo Notebook",
  description: "Sample product used for local checkout preparation.",
  categoryId: stationeryCategory.id,
  price: createMoney(12.5, "USD"),
});

const mugProduct = createProduct({
  id: "sample-product-mug",
  shopId: marketShop.id,
  name: "Demo Mug",
  description: "Sample product used for mock checkout scenarios.",
  categoryId: accessoriesCategory.id,
  price: createMoney(18, "USD"),
});

const toteProduct = createProduct({
  id: "sample-product-tote",
  shopId: marketShop.id,
  name: "Demo Tote",
  description: "Inactive sample product for catalog inspection.",
  categoryId: accessoriesCategory.id,
  price: createMoney(24, "USD"),
  active: false,
});

const consultingProduct = createProduct({
  id: "sample-product-consulting",
  shopId: servicesShop.id,
  name: "Demo Consultation",
  description: "Sample service item for non-retail catalog examples.",
  categoryId: servicesCategory.id,
  price: createMoney(75, "USD"),
});

const sampleCustomer = createCustomer({
  id: "sample-customer-alex",
  name: "Alex Demo",
  email: "alex.demo@example.test",
  phone: "+10000000000",
  country: "US",
  address: {
    line1: "100 Demo Street",
    city: "Sample City",
    region: "CA",
    postalCode: "90000",
    country: "US",
  },
});

const sampleCart = createCart({
  id: "sample-cart-market",
  shopId: marketShop.id,
  currency: "USD",
  items: [createCartItemFromProduct(notebookProduct, 1), createCartItemFromProduct(mugProduct, 2)],
});

const successfulOrder = createOrder({
  id: "sample-order-success",
  shopId: marketShop.id,
  customerId: sampleCustomer.id,
  createdAt: demoCreatedAt,
  status: "completed",
  items: [
    {
      productId: notebookProduct.id,
      productName: notebookProduct.name,
      quantity: 1,
      unitPrice: notebookProduct.price,
      lineTotal: createMoney(12.5, "USD"),
    },
  ],
  total: createMoney(12.5, "USD"),
});

const failedOrder = createOrder({
  id: "sample-order-failure",
  shopId: marketShop.id,
  customerId: sampleCustomer.id,
  createdAt: demoFailedAt,
  status: "pending",
  items: [
    {
      productId: mugProduct.id,
      productName: mugProduct.name,
      quantity: 1,
      unitPrice: mugProduct.price,
      lineTotal: createMoney(18, "USD"),
    },
  ],
  total: createMoney(18, "USD"),
});

const cancelledOrder = createOrder({
  id: "sample-order-cancelled",
  shopId: marketShop.id,
  customerId: sampleCustomer.id,
  createdAt: demoCancelledAt,
  status: "cancelled",
  items: [
    {
      productId: mugProduct.id,
      productName: mugProduct.name,
      quantity: 1,
      unitPrice: mugProduct.price,
      lineTotal: createMoney(18, "USD"),
    },
  ],
  total: createMoney(18, "USD"),
});

export const demoCheckoutScenarios = ["success", "failure", "cancel"] as const;

export function createDemoSeed(seed: FakeShopSeed = {}): FakeShopSeed {
  return {
    shops: seed.shops ?? [marketShop, servicesShop],
    categories: seed.categories ?? [stationeryCategory, accessoriesCategory, servicesCategory],
    products: seed.products ?? [notebookProduct, mugProduct, toteProduct, consultingProduct],
    customers: seed.customers ?? [sampleCustomer],
    carts: seed.carts ?? [sampleCart],
    orders: seed.orders ?? [successfulOrder, failedOrder, cancelledOrder],
    checkoutSessions: seed.checkoutSessions ?? [
      createCheckoutSession({
        id: "sample-checkout-session-success",
        orderId: successfulOrder.id,
        createdAt: demoCreatedAt,
        status: "succeeded",
        result: {
          adapterId: "mock-checkout",
          adapterName: "Mock checkout",
          message: "Sample mock checkout completed successfully.",
          recordedAt: demoCompletedAt,
          scenario: "success",
        },
      }),
      createCheckoutSession({
        id: "sample-checkout-session-failure",
        orderId: failedOrder.id,
        createdAt: demoFailedAt,
        status: "failed",
        result: {
          adapterId: "mock-checkout",
          adapterName: "Mock checkout",
          message: "Sample mock checkout failure for developer inspection.",
          recordedAt: demoFailedAt,
          scenario: "failure",
        },
      }),
      createCheckoutSession({
        id: "sample-checkout-session-cancelled",
        orderId: cancelledOrder.id,
        createdAt: demoCancelledAt,
        status: "cancelled",
        result: {
          adapterId: "mock-checkout",
          adapterName: "Mock checkout",
          message: "Sample mock checkout cancellation for developer inspection.",
          recordedAt: demoCancelledAt,
          scenario: "cancel",
        },
      }),
    ],
    integrationConfigurations: seed.integrationConfigurations ?? [
      {
        id: `integration-${marketShop.id}`,
        shopId: marketShop.id,
        mode: "mock",
        updatedAt: demoCreatedAt,
      },
      {
        id: `integration-${servicesShop.id}`,
        shopId: servicesShop.id,
        mode: "mock",
        updatedAt: demoCreatedAt,
      },
    ],
  };
}
