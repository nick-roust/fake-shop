import assert from "node:assert/strict";
import test from "node:test";

import {
  inspectLocalDemoState,
  resetLocalDemoState,
  reseedLocalDemoState,
} from "../../src/storage/local-demo-boundary";

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
