export type NavigationItem = {
  label: string;
  href: string;
  description: string;
};

export const navigationItems = [
  {
    label: "Dashboard",
    href: "#dashboard",
    description: "Future overview area.",
  },
  {
    label: "Shops",
    href: "#shops",
    description: "Future shop management area.",
  },
  {
    label: "Products",
    href: "#products",
    description: "Future catalog area.",
  },
  {
    label: "Checkout",
    href: "#checkout",
    description: "Future checkout preparation area.",
  },
  {
    label: "Orders",
    href: "#orders",
    description: "Future order visibility area.",
  },
  {
    label: "Integration Settings",
    href: "#integration-settings",
    description: "Future adapter configuration area.",
  },
] as const satisfies readonly NavigationItem[];
