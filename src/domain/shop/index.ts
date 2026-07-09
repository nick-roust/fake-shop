import { type EntityId, requireNonEmpty } from "../shared";

export type ShopDisplaySettings = {
  displayName?: string;
  accentColor?: string;
};

export type Shop = {
  id: EntityId;
  name: string;
  description?: string;
  category?: string;
  scenario?: string;
  displaySettings?: ShopDisplaySettings;
  productIds: EntityId[];
  orderIds: EntityId[];
};

export type CreateShopInput = {
  id: EntityId;
  name: string;
  description?: string;
  category?: string;
  scenario?: string;
  displaySettings?: ShopDisplaySettings;
  productIds?: EntityId[];
  orderIds?: EntityId[];
};

export function createShop(input: CreateShopInput): Shop {
  return {
    id: requireNonEmpty(input.id, "Shop id"),
    name: requireNonEmpty(input.name, "Shop name"),
    description: input.description?.trim() || undefined,
    category: input.category?.trim() || undefined,
    scenario: input.scenario?.trim() || undefined,
    displaySettings: normalizeDisplaySettings(input.displaySettings),
    productIds: input.productIds ?? [],
    orderIds: input.orderIds ?? [],
  };
}

function normalizeDisplaySettings(
  displaySettings: ShopDisplaySettings | undefined
): ShopDisplaySettings | undefined {
  if (!displaySettings) {
    return undefined;
  }

  const normalized = {
    displayName: displaySettings.displayName?.trim() || undefined,
    accentColor: displaySettings.accentColor?.trim() || undefined,
  };

  return Object.values(normalized).some(Boolean) ? normalized : undefined;
}
