export type NavigationItem = {
  label: string;
  href: string;
  description: string;
};

export const navigationItems = [
  {
    label: "Dashboard",
    href: "/",
    description: "Review local demo commerce activity.",
  },
  {
    label: "Shops",
    href: "/shops",
    description: "Manage fake storefronts.",
  },
  {
    label: "Developer Tools",
    href: "/developer",
    description: "Inspect local demo state and load sample data.",
  },
] as const satisfies readonly NavigationItem[];
