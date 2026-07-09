import { type EntityId, type Money, requireNonEmpty } from "../shared";

export type Category = {
  id: EntityId;
  shopId: EntityId;
  name: string;
  description?: string;
};

export type Product = {
  id: EntityId;
  shopId: EntityId;
  name: string;
  description?: string;
  categoryId?: EntityId;
  price: Money;
  active: boolean;
};

export type CreateCategoryInput = {
  id: EntityId;
  shopId: EntityId;
  name: string;
  description?: string;
};

export type CreateProductInput = {
  id: EntityId;
  shopId: EntityId;
  name: string;
  description?: string;
  categoryId?: EntityId;
  price: Money;
  active?: boolean;
};

export function createCategory(input: CreateCategoryInput): Category {
  return {
    id: requireNonEmpty(input.id, "Category id"),
    shopId: requireNonEmpty(input.shopId, "Shop id"),
    name: requireNonEmpty(input.name, "Category name"),
    description: input.description?.trim() || undefined,
  };
}

export function createProduct(input: CreateProductInput): Product {
  return {
    id: requireNonEmpty(input.id, "Product id"),
    shopId: requireNonEmpty(input.shopId, "Shop id"),
    name: requireNonEmpty(input.name, "Product name"),
    description: input.description?.trim() || undefined,
    categoryId: input.categoryId?.trim() || undefined,
    price: input.price,
    active: input.active ?? true,
  };
}
