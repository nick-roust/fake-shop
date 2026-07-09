"use client";

import { type CheckoutSession } from "@/domain/checkout";
import { type Customer } from "@/domain/customer";
import { type Order } from "@/domain/order";
import { type Shop } from "@/domain/shop";
import { getLocalDemoRepositories } from "@/storage/local-demo-boundary";

export type OrderRecord = {
  customer?: Customer;
  order: Order;
  session?: CheckoutSession;
  shop?: Shop;
};

export function listShopOrders(shopId: string): OrderRecord[] {
  const repositories = getLocalDemoRepositories();

  return repositories.orders
    .list()
    .filter((order) => order.shopId === shopId)
    .sort((left, right) => getOrderTime(right) - getOrderTime(left))
    .map((order) => ({
      order,
      shop: repositories.shops.getById(order.shopId),
      customer: repositories.customers.getById(order.customerId),
      session: findLatestSession(order.id),
    }));
}

export function getOrderRecord(orderId: string, shopId: string): OrderRecord | undefined {
  const repositories = getLocalDemoRepositories();
  const order = repositories.orders.getById(orderId);

  if (!order || order.shopId !== shopId) {
    return undefined;
  }

  return {
    order,
    shop: repositories.shops.getById(order.shopId),
    customer: repositories.customers.getById(order.customerId),
    session: findLatestSession(order.id),
  };
}

function findLatestSession(orderId: string): CheckoutSession | undefined {
  return getLocalDemoRepositories()
    .checkoutSessions.list()
    .filter((session) => session.orderId === orderId)
    .at(-1);
}

function getOrderTime(order: Order): number {
  const time = new Date(order.createdAt).getTime();

  return Number.isNaN(time) ? 0 : time;
}
