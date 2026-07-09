import { type Cart } from "@/domain/cart";
import { type CheckoutSession } from "@/domain/checkout";
import { type Customer } from "@/domain/customer";
import { type Order } from "@/domain/order";
import { type Category, type Product } from "@/domain/product";
import { type Shop } from "@/domain/shop";

export type FakeShopStorageSnapshot = {
  shops: Shop[];
  categories: Category[];
  products: Product[];
  customers: Customer[];
  carts: Cart[];
  orders: Order[];
  checkoutSessions: CheckoutSession[];
};

export type FakeShopSeed = Partial<FakeShopStorageSnapshot>;

export type LocalPersistenceDriver = {
  read(): FakeShopStorageSnapshot | null;
  write(snapshot: FakeShopStorageSnapshot): void;
  clear(): void;
};

export function createEmptyStorageSnapshot(): FakeShopStorageSnapshot {
  return {
    shops: [],
    categories: [],
    products: [],
    customers: [],
    carts: [],
    orders: [],
    checkoutSessions: [],
  };
}

export function createStorageSnapshot(seed: FakeShopSeed = {}): FakeShopStorageSnapshot {
  return {
    shops: seed.shops ?? [],
    categories: seed.categories ?? [],
    products: seed.products ?? [],
    customers: seed.customers ?? [],
    carts: seed.carts ?? [],
    orders: seed.orders ?? [],
    checkoutSessions: seed.checkoutSessions ?? [],
  };
}
