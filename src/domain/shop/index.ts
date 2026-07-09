import { type EntityId, requireNonEmpty } from "../shared";

export type Shop = {
  id: EntityId;
  name: string;
  description?: string;
  category?: string;
  scenario?: string;
  productIds: EntityId[];
  orderIds: EntityId[];
};

export type CreateShopInput = {
  id: EntityId;
  name: string;
  description?: string;
  category?: string;
  scenario?: string;
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
    productIds: input.productIds ?? [],
    orderIds: input.orderIds ?? [],
  };
}
