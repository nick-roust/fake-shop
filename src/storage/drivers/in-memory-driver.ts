import {
  createStorageSnapshot,
  type FakeShopSeed,
  type FakeShopStorageSnapshot,
  type LocalPersistenceDriver,
} from "../types";

export class InMemoryPersistenceDriver implements LocalPersistenceDriver {
  private snapshot: FakeShopStorageSnapshot | null;

  constructor(seed?: FakeShopSeed) {
    this.snapshot = seed ? createStorageSnapshot(seed) : null;
  }

  read(): FakeShopStorageSnapshot | null {
    return this.snapshot ? createStorageSnapshot(this.snapshot) : null;
  }

  write(snapshot: FakeShopStorageSnapshot): void {
    this.snapshot = createStorageSnapshot(snapshot);
  }

  clear(): void {
    this.snapshot = null;
  }
}
