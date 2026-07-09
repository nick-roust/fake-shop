import {
  createStorageSnapshot,
  type FakeShopStorageSnapshot,
  type LocalPersistenceDriver,
} from "../types";

export type BrowserLocalStorageDriverOptions = {
  storageKey: string;
  storage?: Storage;
};

export class BrowserLocalStoragePersistenceDriver implements LocalPersistenceDriver {
  private readonly storageKey: string;
  private readonly storage?: Storage;

  constructor(options: BrowserLocalStorageDriverOptions) {
    this.storageKey = options.storageKey;
    this.storage = options.storage ?? getBrowserStorage();
  }

  read(): FakeShopStorageSnapshot | null {
    if (!this.storage) {
      return null;
    }

    const rawSnapshot = this.storage.getItem(this.storageKey);

    if (!rawSnapshot) {
      return null;
    }

    try {
      return createStorageSnapshot(JSON.parse(rawSnapshot) as FakeShopStorageSnapshot);
    } catch {
      return null;
    }
  }

  write(snapshot: FakeShopStorageSnapshot): void {
    this.storage?.setItem(this.storageKey, JSON.stringify(snapshot));
  }

  clear(): void {
    this.storage?.removeItem(this.storageKey);
  }
}

function getBrowserStorage(): Storage | undefined {
  if (typeof globalThis.localStorage === "undefined") {
    return undefined;
  }

  return globalThis.localStorage;
}
