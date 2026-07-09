import { BrowserLocalStoragePersistenceDriver } from "./drivers/browser-local-storage-driver";
import { LocalDemoStore } from "./local-demo-store";
import { type FakeShopRepositories } from "./repositories/repository-boundaries";

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
