import { type Cart, type CartItem, getCartItemLineTotal, getCartTotal } from "../cart";
import { type Customer } from "../customer";
import { type EntityId, type Money, requireNonEmpty, sumMoney } from "../shared";

export type OrderStatus = "created" | "pending" | "completed" | "cancelled";

export type OrderItem = {
  productId: EntityId;
  productName: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
};

export type Order = {
  id: EntityId;
  shopId: EntityId;
  customerId: EntityId;
  items: OrderItem[];
  total: Money;
  status: OrderStatus;
};

export type CreateOrderInput = {
  id: EntityId;
  shopId: EntityId;
  customerId: EntityId;
  items: OrderItem[];
  total: Money;
  status?: OrderStatus;
};

export type CreateOrderFromCartInput = {
  id: EntityId;
  cart: Cart;
  customer: Customer;
  status?: OrderStatus;
};

export function createOrder(input: CreateOrderInput): Order {
  return {
    id: requireNonEmpty(input.id, "Order id"),
    shopId: requireNonEmpty(input.shopId, "Shop id"),
    customerId: requireNonEmpty(input.customerId, "Customer id"),
    items: input.items,
    total: input.total,
    status: input.status ?? "created",
  };
}

export function createOrderItemFromCartItem(item: CartItem): OrderItem {
  return {
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: getCartItemLineTotal(item),
  };
}

export function createOrderFromCart(input: CreateOrderFromCartInput): Order {
  return createOrder({
    id: input.id,
    shopId: input.cart.shopId,
    customerId: input.customer.id,
    items: input.cart.items.map((item) => createOrderItemFromCartItem(item)),
    total: getCartTotal(input.cart),
    status: input.status,
  });
}

export function getOrderTotal(order: Pick<Order, "items" | "total">): Money {
  return sumMoney(
    order.items.map((item) => item.lineTotal),
    order.total.currency
  );
}
