"use client";

import { type CheckoutSession } from "@/domain/checkout";
import { type Order } from "@/domain/order";
import { inspectLocalDemoState } from "@/storage/local-demo-boundary";

export type DashboardSummary = {
  checkoutSessions: {
    cancelled: number;
    created: number;
    failed: number;
    pending: number;
    succeeded: number;
    total: number;
  };
  orders: {
    cancelled: number;
    completed: number;
    created: number;
    pending: number;
    total: number;
  };
  products: {
    active: number;
    inactive: number;
    total: number;
  };
  recentOrders: DashboardRecentOrder[];
  sampleShopId?: string;
  shops: {
    total: number;
  };
};

export type DashboardRecentOrder = {
  checkoutStatus: string;
  createdAt: string;
  customer: string;
  id: string;
  shop: string;
  shopId: string;
  status: string;
  total: string;
};

export function getDashboardSummary(): DashboardSummary {
  const snapshot = inspectLocalDemoState();
  const recentOrders = [...snapshot.orders]
    .sort((left, right) => getTime(right.createdAt) - getTime(left.createdAt))
    .slice(0, 5)
    .map((order) => toRecentOrder(order, findLatestSession(snapshot.checkoutSessions, order.id)));

  return {
    checkoutSessions: {
      cancelled: countByStatus(snapshot.checkoutSessions, "cancelled"),
      created: countByStatus(snapshot.checkoutSessions, "created"),
      failed: countByStatus(snapshot.checkoutSessions, "failed"),
      pending: countByStatus(snapshot.checkoutSessions, "pending"),
      succeeded: countByStatus(snapshot.checkoutSessions, "succeeded"),
      total: snapshot.checkoutSessions.length,
    },
    orders: {
      cancelled: countByStatus(snapshot.orders, "cancelled"),
      completed: countByStatus(snapshot.orders, "completed"),
      created: countByStatus(snapshot.orders, "created"),
      pending: countByStatus(snapshot.orders, "pending"),
      total: snapshot.orders.length,
    },
    products: {
      active: snapshot.products.filter((product) => product.active).length,
      inactive: snapshot.products.filter((product) => !product.active).length,
      total: snapshot.products.length,
    },
    recentOrders,
    sampleShopId: snapshot.shops.find((shop) => shop.id.startsWith("sample-"))?.id,
    shops: {
      total: snapshot.shops.length,
    },
  };

  function toRecentOrder(order: Order, session: CheckoutSession | undefined): DashboardRecentOrder {
    const shop = snapshot.shops.find((item) => item.id === order.shopId);
    const customer = snapshot.customers.find((item) => item.id === order.customerId);

    return {
      checkoutStatus: session?.status ?? "none",
      createdAt: order.createdAt,
      customer: customer?.name ?? "Unknown customer",
      id: order.id,
      shop: shop?.name ?? "Unknown shop",
      shopId: order.shopId,
      status: order.status,
      total: `${order.total.amount.toFixed(2)} ${order.total.currency}`,
    };
  }
}

function countByStatus<TEntity extends { status: string }>(
  entities: TEntity[],
  status: TEntity["status"]
): number {
  return entities.filter((entity) => entity.status === status).length;
}

function findLatestSession(
  sessions: CheckoutSession[],
  orderId: string
): CheckoutSession | undefined {
  return sessions.filter((session) => session.orderId === orderId).at(-1);
}

function getTime(value: string): number {
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}
