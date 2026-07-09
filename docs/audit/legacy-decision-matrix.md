# Legacy Decision Matrix

## Purpose

Record the historical decision about what belongs in the rebuilt fake-shop project.

## Status

Historical.

## Reusable Concepts

- Realistic fake storefront behavior.
- Editable catalog and checkout preparation data.
- Visible order and checkout status.
- Local demo flows that developers can reproduce.
- Adapter boundary for checkout experiments.

## Discarded Concepts

- Legacy source architecture.
- Local-only service assumptions.
- Hard-coded legacy identifiers.
- Stale scenario scripts.
- Implementation-specific payload vocabulary.

## Rebuilt Concepts

- Shop management was rebuilt as a public fake storefront feature.
- Product catalog was rebuilt around sample products and categories.
- Checkout was rebuilt around cart preparation, customer information, orders, and checkout sessions.
- Integration behavior was rebuilt around mock and external adapter boundaries.
- Testing was rebuilt around unit, integration, end-to-end, and smoke tests.

## Migration Risks

- Treating legacy implementation as current architecture.
- Letting adapter details leak into domain entities.
- Requiring external services for the default local demo.
- Documenting historical behavior as current product behavior.

## New Fake-Shop Boundaries

fake-shop is an independent open-source reference commerce application. It uses public commerce terminology, provider-neutral checkout statuses, local demo data, replaceable storage boundaries, and isolated integration adapters.

The current project direction is consumer-friendly, local-first, and understandable without project history.

ANALYSIS COMPLETE
