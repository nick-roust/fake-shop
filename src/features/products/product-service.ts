"use client";

import { createMoney } from "@/domain/shared";
import { type Shop, createShop } from "@/domain/shop";
import { createCategory, createProduct, type Category, type Product } from "@/domain/product";
import { getLocalDemoRepositories } from "@/storage/local-demo-boundary";

import { type ProductFormValues } from "./product-form";

export function getProductCatalog(shopId: string): {
  categories: Category[];
  products: Product[];
  shop: Shop | undefined;
} {
  const repositories = getLocalDemoRepositories();

  return {
    shop: repositories.shops.getById(shopId),
    categories: repositories.categories.list().filter((category) => category.shopId === shopId),
    products: repositories.products.list().filter((product) => product.shopId === shopId),
  };
}

export function createManagedProduct(shop: Shop, values: ProductFormValues): Product {
  const repositories = getLocalDemoRepositories();
  const category = resolveCategory(shop.id, values.categoryName);
  const product = createProduct({
    id: createEntityId("product"),
    shopId: shop.id,
    name: values.name,
    description: values.description,
    categoryId: category?.id,
    price: createMoney(Number(values.price), values.currency),
    active: values.active,
  });

  repositories.products.save(product);
  repositories.shops.save(
    createShop({
      ...shop,
      productIds: Array.from(new Set([...shop.productIds, product.id])),
    })
  );

  return product;
}

export function updateManagedProduct(product: Product, values: ProductFormValues): Product {
  const category = resolveCategory(product.shopId, values.categoryName);
  const updatedProduct = createProduct({
    ...product,
    name: values.name,
    description: values.description,
    categoryId: category?.id,
    price: createMoney(Number(values.price), values.currency),
    active: values.active,
  });

  return getLocalDemoRepositories().products.save(updatedProduct);
}

function resolveCategory(shopId: string, categoryName: string): Category | undefined {
  const normalizedName = categoryName.trim();

  if (!normalizedName) {
    return undefined;
  }

  const repositories = getLocalDemoRepositories();
  const existingCategory = repositories.categories
    .list()
    .find(
      (category) =>
        category.shopId === shopId && category.name.toLowerCase() === normalizedName.toLowerCase()
    );

  if (existingCategory) {
    return existingCategory;
  }

  return repositories.categories.save(
    createCategory({
      id: createEntityId("category"),
      shopId,
      name: normalizedName,
    })
  );
}

function createEntityId(prefix: string): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${prefix}-${Date.now().toString(36)}`;
}
