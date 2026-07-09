# Legacy Audit

## Purpose

Record historical findings from the removed legacy implementation that informed the rebuild of fake-shop.

## Status

Historical.

## Historical Context

The legacy implementation was used only for audit and migration analysis. It was not carried forward as the source architecture for fake-shop.

The current repository has been rebuilt as an independent open-source reference commerce application with public terminology, local demo behavior, and provider-neutral checkout boundaries.

## Reusable Findings

Useful concepts identified during the audit:

- a realistic fake storefront is valuable for local demos;
- order entry should be easy to inspect;
- checkout outcomes should be visible to developers;
- integration behavior should stay behind an adapter boundary;
- local demo flows should not require external infrastructure.

## Deprecated Assumptions

Deprecated assumptions identified during the audit:

- legacy implementation details should not define the new architecture;
- local-only service assumptions should not be required by public users;
- hard-coded legacy identifiers should not appear in the current product;
- stale scenario scripts should not become current validation guidance;
- implementation-specific payloads should not become domain vocabulary.

## Migration Risks

Migration risks identified during the audit:

- copying legacy structure would preserve outdated coupling;
- exposing adapter payload details as domain concepts would make the project harder to extend;
- requiring external services for the default demo path would reduce open-source usability;
- stale documentation could mislead contributors.

## Current Decision

The legacy implementation has been removed from the workspace. Historical detail remains available through Git history. Current contributors should use the product, architecture, domain, guide, and testing documents as the authoritative project references.

AUDIT COMPLETE
