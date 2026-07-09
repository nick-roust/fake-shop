import { getCartItemLineTotal, getCartTotal, type Cart, type CartItem } from "@/domain/cart";

export type CartItemViewModel = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

export type CartViewModel = {
  currency: string;
  items: CartItemViewModel[];
  total: string;
};

export function toCartViewModel(cart: Cart): CartViewModel {
  return {
    currency: cart.currency,
    items: cart.items.map((item) => toCartItemViewModel(item)),
    total: getCartTotal(cart).amount.toFixed(2),
  };
}

function toCartItemViewModel(item: CartItem): CartItemViewModel {
  return {
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice.amount.toFixed(2),
    lineTotal: getCartItemLineTotal(item).amount.toFixed(2),
  };
}
