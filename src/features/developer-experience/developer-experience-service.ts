"use client";

import { type CheckoutSession } from "@/domain/checkout";
import { type Order } from "@/domain/order";
import {
  inspectLocalDemoState,
  resetLocalDemoState,
  reseedLocalDemoState,
} from "@/storage/local-demo-boundary";
import { demoCheckoutScenarios } from "@/storage/seed";
import { type FakeShopStorageSnapshot } from "@/storage/types";

export type DeveloperStateSummary = {
  checkoutScenarios: readonly string[];
  counts: {
    carts: number;
    categories: number;
    checkoutSessions: number;
    customers: number;
    integrationConfigurations: number;
    orders: number;
    products: number;
    shops: number;
  };
  integrationModes: {
    mode: string;
    shopId: string;
  }[];
  latestOrder?: Order;
  latestSession?: CheckoutSession;
  sampleShopId?: string;
};

export function inspectDeveloperState(): DeveloperStateSummary {
  return createDeveloperStateSummary(inspectLocalDemoState());
}

export function loadSampleDemoState(): DeveloperStateSummary {
  return createDeveloperStateSummary(reseedLocalDemoState());
}

export function resetDeveloperState(): DeveloperStateSummary {
  return createDeveloperStateSummary(resetLocalDemoState());
}

function createDeveloperStateSummary(snapshot: FakeShopStorageSnapshot): DeveloperStateSummary {
  const latestOrder = snapshot.orders.at(-1);
  const latestSession = latestOrder
    ? snapshot.checkoutSessions.find((session) => session.orderId === latestOrder.id)
    : snapshot.checkoutSessions.at(-1);

  return {
    checkoutScenarios: demoCheckoutScenarios,
    counts: {
      carts: snapshot.carts.length,
      categories: snapshot.categories.length,
      checkoutSessions: snapshot.checkoutSessions.length,
      customers: snapshot.customers.length,
      integrationConfigurations: snapshot.integrationConfigurations.length,
      orders: snapshot.orders.length,
      products: snapshot.products.length,
      shops: snapshot.shops.length,
    },
    integrationModes: snapshot.integrationConfigurations.map((configuration) => ({
      mode: configuration.mode,
      shopId: configuration.shopId,
    })),
    latestOrder,
    latestSession,
    sampleShopId: snapshot.shops.find((shop) => shop.id.startsWith("sample-"))?.id,
  };
}
