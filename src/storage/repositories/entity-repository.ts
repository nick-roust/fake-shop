import { type EntityId } from "@/domain/shared";

export type EntityRepository<TEntity extends { id: EntityId }> = {
  list(): TEntity[];
  getById(id: EntityId): TEntity | undefined;
  save(entity: TEntity): TEntity;
  remove(id: EntityId): void;
  clear(): void;
};

export class SnapshotEntityRepository<
  TEntity extends { id: EntityId },
> implements EntityRepository<TEntity> {
  constructor(
    private readonly readCollection: () => TEntity[],
    private readonly writeCollection: (entities: TEntity[]) => void,
    private readonly persist: () => void
  ) {}

  list(): TEntity[] {
    return [...this.readCollection()];
  }

  getById(id: EntityId): TEntity | undefined {
    return this.readCollection().find((entity) => entity.id === id);
  }

  save(entity: TEntity): TEntity {
    const entities = this.readCollection();
    const existingIndex = entities.findIndex((item) => item.id === entity.id);
    const nextEntities =
      existingIndex >= 0
        ? entities.map((item) => (item.id === entity.id ? entity : item))
        : [...entities, entity];

    this.writeCollection(nextEntities);
    this.persist();

    return entity;
  }

  remove(id: EntityId): void {
    this.writeCollection(this.readCollection().filter((entity) => entity.id !== id));
    this.persist();
  }

  clear(): void {
    this.writeCollection([]);
    this.persist();
  }
}
