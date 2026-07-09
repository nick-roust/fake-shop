import { type Product } from "../product";
import {
  type CurrencyCode,
  type EntityId,
  type Money,
  multiplyMoney,
  requireNonEmpty,
  requirePositiveQuantity,
  sumMoney,
} from "../shared";

export type CartItem = {
  productId: EntityId;
  productName: string;
  quantity: number;
  unitPrice: Money;
};

export type Cart = {
  id: EntityId;
  shopId: EntityId;
  items: CartItem[];
  currency: CurrencyCode;
};

export type CreateCartInput = {
  id: EntityId;
  shopId: EntityId;
  currency: CurrencyCode;
  items?: CartItem[];
};

export type CreateCartItemInput = {
  productId: EntityId;
  productName: string;
  quantity: number;
  unitPrice: Money;
};

export function createCart(input: CreateCartInput): Cart {
  return {
    id: requireNonEmpty(input.id, "Cart id"),
    shopId: requireNonEmpty(input.shopId, "Shop id"),
    currency: requireNonEmpty(input.currency, "Cart currency"),
    items: input.items ?? [],
  };
}

export function createCartItem(input: CreateCartItemInput): CartItem {
  return {
    productId: requireNonEmpty(input.productId, "Product id"),
    productName: requireNonEmpty(input.productName, "Product name"),
    quantity: requirePositiveQuantity(input.quantity),
    unitPrice: input.unitPrice,
  };
}

export function createCartItemFromProduct(product: Product, quantity: number): CartItem {
  return createCartItem({
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
  });
}

export function getCartItemLineTotal(item: CartItem): Money {
  return multiplyMoney(item.unitPrice, item.quantity);
}

export function getCartTotal(cart: Cart): Money {
  return sumMoney(
    cart.items.map((item) => getCartItemLineTotal(item)),
    cart.currency
  );
}
