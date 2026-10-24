import { type Cart } from "@/domain/cart";
import { type CheckoutSession } from "@/domain/checkout";
import { type Customer } from "@/domain/customer";
import { type Order } from "@/domain/order";
import { type Category, type Product } from "@/domain/product";
import { type Shop } from "@/domain/shop";

export type IntegrationMode = "mock" | "external";

export type IntegrationConfiguration = {
  id: string;
  shopId: string;
  mode: IntegrationMode;
  externalBaseUrl?: string;
  externalReference?: string;
  updatedAt: string;
};

export type FakeShopStorageSnapshot = {
  schemaVersion: 1;
  shops: Shop[];
  categories: Category[];
  products: Product[];
  customers: Customer[];
  carts: Cart[];
  orders: Order[];
  checkoutSessions: CheckoutSession[];
  integrationConfigurations: IntegrationConfiguration[];
};

export type FakeShopSeed = Partial<FakeShopStorageSnapshot>;

export type LocalPersistenceDriver = {
  read(): FakeShopStorageSnapshot | null;
  write(snapshot: FakeShopStorageSnapshot): void;
  clear(): void;
};

export function createEmptyStorageSnapshot(): FakeShopStorageSnapshot {
  return {
    schemaVersion: 1,
    shops: [],
    categories: [],
    products: [],
    customers: [],
    carts: [],
    orders: [],
    checkoutSessions: [],
    integrationConfigurations: [],
  };
}

export function createStorageSnapshot(seed: FakeShopSeed = {}): FakeShopStorageSnapshot {
  return {
    schemaVersion: 1,
    shops: seed.shops ?? [],
    categories: seed.categories ?? [],
    products: seed.products ?? [],
    customers: seed.customers ?? [],
    carts: seed.carts ?? [],
    orders: seed.orders ?? [],
    checkoutSessions: seed.checkoutSessions ?? [],
    integrationConfigurations: seed.integrationConfigurations ?? [],
  };
}

export function migrateStoredSnapshot(value: unknown): FakeShopStorageSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Stored fake-shop data is not a valid snapshot.");
  }
  const snapshot = value as Record<string, unknown>;
  const version = snapshot.schemaVersion;
  if (version !== undefined && version !== 1) {
    throw new Error(`Unsupported fake-shop storage schema version: ${String(version)}.`);
  }
  const collections = [
    "shops",
    "categories",
    "products",
    "customers",
    "carts",
    "orders",
    "checkoutSessions",
    "integrationConfigurations",
  ];
  for (const collection of collections) {
    if (snapshot[collection] !== undefined && !Array.isArray(snapshot[collection])) {
      throw new Error(`Stored fake-shop collection ${collection} is invalid.`);
    }
    const records = snapshot[collection];
    if (Array.isArray(records)) {
      for (const record of records) {
        if (
          !record ||
          typeof record !== "object" ||
          Array.isArray(record) ||
          typeof (record as { id?: unknown }).id !== "string" ||
          !(record as { id: string }).id.trim()
        ) {
          throw new Error(`Stored fake-shop collection ${collection} contains an invalid record.`);
        }
      }
    }
  }
  // Version 0 was the existing unversioned localStorage format. Keep all records intact.
  return createStorageSnapshot(snapshot as FakeShopSeed);
}
