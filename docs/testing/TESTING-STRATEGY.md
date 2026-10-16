# Testing Strategy

## Purpose

Describe the testing strategy for fake-shop.

## Status

Active foundation.

## Testing Philosophy

Tests protect existing fake-shop behavior and architecture boundaries before additional v0.1 work continues.

The foundation emphasizes:

- deterministic domain behavior;
- repository boundary usage;
- provider-neutral checkout status handling;
- reproducible local demo flows;
- no dependency on external services.

## Test Boundaries

Test groups:

- Unit tests cover domain calculations, checkout session transitions, and adapter contract behavior.
- Integration tests cover storage boundaries and feature service flows.
- End-to-end tests cover the main user journey through public application services.
- Smoke tests cover developer demo state and reproducible mock checkout behavior.

Tests must not introduce provider-specific assumptions, production infrastructure, or unavailable runtime concepts.

## Test Commands

Run all tests:

```bash
pnpm run test
```

Run targeted groups:

```bash
pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e
pnpm run test:smoke
```

## Validation Approach

Run full local validation:

```bash
pnpm run check
pnpm run test
pnpm run build
```

Run route smoke validation while the application is running:

```bash
pnpm run smoke:routes
```

## GitHub Actions Preview UI Tests

Vercel's GitHub integration deploys branch commits as Preview deployments. When a non-production
deployment reports success, the Playwright workflow runs the private `fake-shop-playwright-tests`
suite against the deployment URL from the GitHub deployment event. The test repository's Playwright
configuration should read `BASE_URL` as its `baseURL`, with `http://localhost:3000` as the local
default.

Configure the Vercel GitHub App to access `fake-shop` and set `main` as its production branch.
Configure this repository Actions secret:

- `PLAYWRIGHT_TESTS_REPO_TOKEN` (read access to `fake-shop-playwright-tests`)

If preview protection is enabled, add the Vercel Protection Bypass for Automation value to this
repository as `VERCEL_AUTOMATION_BYPASS_SECRET`, and configure the test repository's Playwright
`use.extraHTTPHeaders` with `x-vercel-protection-bypass` from that environment variable. QA can
access previews through Vercel or a Vercel shareable link without access to the app source repo.

After Preview UI tests pass, the workflow waits for `CI` to pass on the same commit and merges the
matching open pull request into `main`. Vercel then creates the Production deployment from `main`.
The Production deployment runs the UI tests but does not trigger another merge. The merge job uses
the workflow token with Actions read, Contents write, and Pull requests write permissions; GitHub
branch protection and review requirements still apply.
