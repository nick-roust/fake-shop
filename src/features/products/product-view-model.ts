import { type Category, type Product } from "@/domain/product";

export type ProductViewModel = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  currency: string;
  active: boolean;
};

export function toProductViewModel(product: Product, categories: Category[]): ProductViewModel {
  const category = categories.find((item) => item.id === product.categoryId);

  return {
    id: product.id,
    name: product.name,
    description: product.description || "No description",
    category: category?.name || "Uncategorized",
    price: product.price.amount.toFixed(2),
    currency: product.price.currency,
    active: product.active,
  };
}
