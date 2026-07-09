const baseUrl =
  process.env.FAKE_SHOP_SMOKE_BASE_URL ??
  process.env.FAKE_SHOP_PUBLIC_URL ??
  "http://127.0.0.1:3000";

const routes = [
  "/",
  "/shops",
  "/developer",
  "/shops/sample-market",
  "/shops/sample-market/products",
  "/shops/sample-market/checkout",
  "/shops/sample-market/orders",
  "/shops/sample-market/integration-settings",
];

const failures = [];

for (const route of routes) {
  const url = new URL(route, baseUrl);

  try {
    const response = await fetch(url);

    if (response.status >= 500) {
      failures.push(`${route} returned ${response.status}`);
    } else {
      console.log(`${route} ${response.status}`);
    }
  } catch (error) {
    failures.push(`${route} failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length > 0) {
  console.error("Route smoke check failed.");
  console.error(`Expected a running fake-shop app at ${baseUrl}.`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Route smoke check passed.");
