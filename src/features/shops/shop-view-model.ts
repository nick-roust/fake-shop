import { type Shop } from "@/domain/shop";

export type ShopViewModel = {
  id: string;
  name: string;
  description: string;
  category: string;
  scenario: string;
  displayName: string;
  accentColor: string;
};

export function toShopViewModel(shop: Shop): ShopViewModel {
  return {
    id: shop.id,
    name: shop.name,
    description: shop.description || "No description",
    category: shop.category || "Uncategorized",
    scenario: shop.scenario || "General demo",
    displayName: shop.displaySettings?.displayName || shop.name,
    accentColor: shop.displaySettings?.accentColor || "Default",
  };
}
