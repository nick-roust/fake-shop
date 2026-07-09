"use client";

import { createShop, type Shop, type ShopDisplaySettings } from "@/domain/shop";
import { getLocalDemoRepositories } from "@/storage/local-demo-boundary";

import { type ShopFormValues } from "./shop-form";

export function listShops(): Shop[] {
  return getLocalDemoRepositories().shops.list();
}

export function getShop(shopId: string): Shop | undefined {
  return getLocalDemoRepositories().shops.getById(shopId);
}

export function createManagedShop(values: ShopFormValues): Shop {
  const shop = createShop({
    id: createShopId(),
    name: values.name,
    description: values.description,
    category: values.category,
    scenario: values.scenario,
    displaySettings: createDisplaySettings(values),
  });

  return getLocalDemoRepositories().shops.save(shop);
}

export function updateManagedShop(shop: Shop, values: ShopFormValues): Shop {
  const updatedShop = createShop({
    ...shop,
    name: values.name,
    description: values.description,
    category: values.category,
    scenario: values.scenario,
    displaySettings: createDisplaySettings(values),
  });

  return getLocalDemoRepositories().shops.save(updatedShop);
}

function createDisplaySettings(values: ShopFormValues): ShopDisplaySettings | undefined {
  return {
    displayName: values.displayName,
    accentColor: values.accentColor,
  };
}

function createShopId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `shop-${Date.now().toString(36)}`;
}
