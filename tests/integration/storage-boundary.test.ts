import assert from "node:assert/strict";
import test from "node:test";

import {
  inspectLocalDemoState,
  resetLocalDemoState,
  reseedLocalDemoState,
} from "../../src/storage/local-demo-boundary";
import { BrowserLocalStoragePersistenceDriver } from "../../src/storage/drivers/browser-local-storage-driver";
import { createStorageSnapshot } from "../../src/storage/types";
import { createCheckoutSession } from "../../src/domain/checkout";

function makeStorage(initial: string) {
  const values = new Map([["fake-shop-local-demo-state", initial]]);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    values,
  } as unknown as Storage & { values: Map<string, string> };
}

test("storage boundary resets and reseeds local demo state", () => {
  resetLocalDemoState();

  assert.equal(inspectLocalDemoState().shops.length, 0);

  const seeded = reseedLocalDemoState();

  assert.equal(seeded.shops.length, 2);
  assert.equal(seeded.products.length, 4);
  assert.equal(seeded.orders.length, 3);
  assert.equal(seeded.checkoutSessions.length, 3);

  const reset = resetLocalDemoState();

  assert.equal(reset.shops.length, 0);
  assert.equal(reset.products.length, 0);
});

test("repositories expose domain-oriented operations through the boundary", async () => {
  resetLocalDemoState();
  reseedLocalDemoState();

  const { getLocalDemoRepositories } = await import("../../src/storage/local-demo-boundary");
  const repositories = getLocalDemoRepositories();
  const shop = repositories.shops.getById("sample-market");
  const products = repositories.products
    .list()
    .filter((product) => product.shopId === "sample-market");

  assert.equal(shop?.name, "Sample Market");
  assert.equal(products.length, 3);
  assert.equal(
    repositories.integrationConfigurations.getById("integration-sample-market")?.mode,
    "mock"
  );
});

test("legacy localStorage snapshot migrates without losing entities and current schema round-trips", () => {
  const legacy = {
    shops: [{ id: "legacy-shop", name: "Legacy", productIds: [], orderIds: [] }],
    categories: [],
    products: [],
    customers: [],
    carts: [],
    orders: [{ id: "legacy-order", shopId: "legacy-shop" }],
    checkoutSessions: [
      {
        id: "legacy-session",
        orderId: "legacy-order",
        status: "pending",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    integrationConfigurations: [],
  };
  const storage = makeStorage(JSON.stringify(legacy));
  const driver = new BrowserLocalStoragePersistenceDriver({
    storageKey: "fake-shop-local-demo-state",
    storage,
  });
  const migrated = driver.read();
  assert.equal(migrated?.schemaVersion, 1);
  assert.equal(migrated?.shops[0]?.id, "legacy-shop");
  assert.equal(migrated?.orders[0]?.id, "legacy-order");
  assert.equal(migrated?.checkoutSessions[0]?.id, "legacy-session");
  assert.equal(
    JSON.parse(storage.values.get("fake-shop-local-demo-state") ?? "{}").schemaVersion,
    1
  );

  const recoverySession = createCheckoutSession({
    id: "recovery-session",
    orderId: "legacy-order",
    status: "pending",
    adapterId: "simulated-redirect-checkout",
    adapterConfiguration: { reference: "captured-reference" },
    result: {
      adapterId: "simulated-redirect-checkout",
      adapterName: "Simulated redirect checkout",
      externalReference: "external-123",
      redirectUrl: "/checkout/return?sessionId=recovery-session",
      message: "Pending",
      provenance: "simulated",
      recordedAt: "2026-01-01T00:00:00.000Z",
      scenario: "delayed-success",
    },
  });
  const current = createStorageSnapshot({
    shops: migrated?.shops,
    checkoutSessions: [recoverySession],
  });
  driver.write(current);
  const reloaded = driver.read();
  assert.deepEqual(reloaded, current);
  assert.equal(reloaded?.checkoutSessions[0]?.result?.externalReference, "external-123");
});

test("unsupported future storage version is rejected without overwriting stored data", () => {
  const futureData = JSON.stringify({
    schemaVersion: 99,
    shops: [],
    categories: [],
    products: [],
    customers: [],
    carts: [],
    orders: [],
    checkoutSessions: [],
    integrationConfigurations: [],
  });
  const storage = makeStorage(futureData);
  const driver = new BrowserLocalStoragePersistenceDriver({
    storageKey: "fake-shop-local-demo-state",
    storage,
  });
  assert.throws(() => driver.read(), /Unable to read fake-shop local data/);
  assert.equal(storage.values.get("fake-shop-local-demo-state"), futureData);
});

test("invalid stored records are rejected without replacing the original snapshot", () => {
  const invalidData = JSON.stringify({
    schemaVersion: 1,
    shops: [{ name: "Missing id" }],
    categories: [],
    products: [],
    customers: [],
    carts: [],
    orders: [],
    checkoutSessions: [],
    integrationConfigurations: [],
  });
  const storage = makeStorage(invalidData);
  const driver = new BrowserLocalStoragePersistenceDriver({
    storageKey: "fake-shop-local-demo-state",
    storage,
  });
  assert.throws(() => driver.read(), /Unable to read fake-shop local data/);
  assert.equal(storage.values.get("fake-shop-local-demo-state"), invalidData);
});
