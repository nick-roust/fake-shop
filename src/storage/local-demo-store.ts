import { type EntityId } from "@/domain/shared";

import { SnapshotEntityRepository } from "./repositories/entity-repository";
import { type FakeShopRepositories } from "./repositories/repository-boundaries";
import {
  createStorageSnapshot,
  type FakeShopSeed,
  type FakeShopStorageSnapshot,
  type LocalPersistenceDriver,
} from "./types";

export class LocalDemoStore {
  readonly repositories: FakeShopRepositories;

  private snapshot: FakeShopStorageSnapshot;
  private readonly initialSeed: FakeShopSeed;

  constructor(
    private readonly driver: LocalPersistenceDriver,
    seed: FakeShopSeed = {}
  ) {
    this.initialSeed = seed;
    this.snapshot = driver.read() ?? createStorageSnapshot(seed);
    this.driver.write(this.snapshot);
    this.repositories = this.createRepositories();
  }

  inspect(): FakeShopStorageSnapshot {
    return createStorageSnapshot(this.snapshot);
  }

  reset(): void {
    this.snapshot = createStorageSnapshot();
    this.driver.clear();
    this.driver.write(this.snapshot);
  }

  reseed(seed: FakeShopSeed = this.initialSeed): void {
    this.snapshot = createStorageSnapshot(seed);
    this.driver.write(this.snapshot);
  }

  private persist(): void {
    this.driver.write(this.snapshot);
  }

  private createRepositories(): FakeShopRepositories {
    return {
      shops: new SnapshotEntityRepository(
        () => this.snapshot.shops,
        (shops) => {
          this.snapshot = { ...this.snapshot, shops };
        },
        () => this.persist()
      ),
      categories: new SnapshotEntityRepository(
        () => this.snapshot.categories,
        (categories) => {
          this.snapshot = { ...this.snapshot, categories };
        },
        () => this.persist()
      ),
      products: new SnapshotEntityRepository(
        () => this.snapshot.products,
        (products) => {
          this.snapshot = { ...this.snapshot, products };
        },
        () => this.persist()
      ),
      customers: new SnapshotEntityRepository(
        () => this.snapshot.customers,
        (customers) => {
          this.snapshot = { ...this.snapshot, customers };
        },
        () => this.persist()
      ),
      carts: new SnapshotEntityRepository(
        () => this.snapshot.carts,
        (carts) => {
          this.snapshot = { ...this.snapshot, carts };
        },
        () => this.persist()
      ),
      orders: new SnapshotEntityRepository(
        () => this.snapshot.orders,
        (orders) => {
          this.snapshot = { ...this.snapshot, orders };
        },
        () => this.persist()
      ),
      checkoutSessions: new SnapshotEntityRepository(
        () => this.snapshot.checkoutSessions,
        (checkoutSessions) => {
          this.snapshot = { ...this.snapshot, checkoutSessions };
        },
        () => this.persist()
      ),
    };
  }
}

export function hasStoredEntity<TEntity extends { id: EntityId }>(
  repository: { getById(id: EntityId): TEntity | undefined },
  id: EntityId
): boolean {
  return Boolean(repository.getById(id));
}
