import { type Cart } from "@/domain/cart";
import { type CheckoutSession } from "@/domain/checkout";
import { type Customer } from "@/domain/customer";
import { type Order } from "@/domain/order";
import { type Category, type Product } from "@/domain/product";
import { type Shop } from "@/domain/shop";

import { type EntityRepository } from "./entity-repository";
import { type IntegrationConfiguration } from "../types";

export type ShopRepository = EntityRepository<Shop>;
export type CategoryRepository = EntityRepository<Category>;
export type ProductRepository = EntityRepository<Product>;
export type CustomerRepository = EntityRepository<Customer>;
export type CartRepository = EntityRepository<Cart>;
export type OrderRepository = EntityRepository<Order>;
export type CheckoutSessionRepository = EntityRepository<CheckoutSession>;
export type IntegrationConfigurationRepository = EntityRepository<IntegrationConfiguration>;

export type FakeShopRepositories = {
  shops: ShopRepository;
  categories: CategoryRepository;
  products: ProductRepository;
  customers: CustomerRepository;
  carts: CartRepository;
  orders: OrderRepository;
  checkoutSessions: CheckoutSessionRepository;
  integrationConfigurations: IntegrationConfigurationRepository;
};
