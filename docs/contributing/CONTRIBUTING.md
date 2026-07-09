# Contributing

## Purpose

Describe contribution rules for fake-shop.

## Status

Active foundation.

## Contribution Rules

- Keep changes small and bounded.
- Preserve documented product and architecture boundaries.
- Do not introduce external service requirements into the default local demo path.
- Do not introduce provider-specific concepts into the domain model.
- Update documentation when behavior, commands, configuration, or project structure changes.

## Code Standards

- Use TypeScript and existing project conventions.
- Keep domain logic independent from UI, storage drivers, and integrations.
- Access local state through repository and storage boundaries.
- Keep adapter diagnostics separate from domain status.
- Run validation before submitting changes.

## Documentation Standards

- Write documentation in English.
- Use public commerce terminology.
- Avoid unavailable infrastructure references and workspace-specific assumptions.
- Keep historical planning documents clearly separated from current implementation guidance.

## Validation

Run:

```bash
pnpm run check
pnpm run test
pnpm run build
```
