import { BrowserLocalStoragePersistenceDriver } from "./drivers/browser-local-storage-driver";
import { LocalDemoStore } from "./local-demo-store";
import { type FakeShopRepositories } from "./repositories/repository-boundaries";
import { createDemoSeed } from "./seed";
import { type FakeShopSeed, type FakeShopStorageSnapshot } from "./types";

const localDemoStorageKey = "fake-shop-local-demo-state";

let localDemoStore: LocalDemoStore | undefined;

export function getLocalDemoStore(): LocalDemoStore {
  localDemoStore ??= new LocalDemoStore(
    new BrowserLocalStoragePersistenceDriver({
      storageKey: localDemoStorageKey,
    })
  );

  return localDemoStore;
}

export function getLocalDemoRepositories(): FakeShopRepositories {
  return getLocalDemoStore().repositories;
}

export function inspectLocalDemoState(): FakeShopStorageSnapshot {
  return getLocalDemoStore().inspect();
}

export function resetLocalDemoState(): FakeShopStorageSnapshot {
  const store = getLocalDemoStore();

  store.reset();

  return store.inspect();
}

export function reseedLocalDemoState(
  seed: FakeShopSeed = createDemoSeed()
): FakeShopStorageSnapshot {
  const store = getLocalDemoStore();

  store.reseed(seed);

  return store.inspect();
}
