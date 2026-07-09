export type NavigationItem = {
  label: string;
  href: string;
  description: string;
};

export const navigationItems = [
  {
    label: "Dashboard",
    href: "/",
    description: "Future overview area.",
  },
  {
    label: "Shops",
    href: "/shops",
    description: "Manage fake storefronts.",
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
    href: "/shops",
    description: "Inspect orders from shop details.",
  },
  {
    label: "Integration Settings",
    href: "/shops",
    description: "Configure checkout mode from shop details.",
  },
  {
    label: "Developer Tools",
    href: "/developer",
    description: "Inspect local demo state and load sample data.",
  },
] as const satisfies readonly NavigationItem[];
