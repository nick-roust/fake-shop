# Legacy fake-shop Audit

## Scope

Audited target: removed legacy implementation.

This audit is observational only. No source code, architecture, file names, or runtime behavior were changed.

## Current State

The removed legacy implementation was a small pnpm workspace for local legacy fake-ecosystem validation. The tracked application surface was one Next.js app plus top-level smoke/scenario scripts.

The repository identity is broader than the implemented code. `README.md` describes a runtime simulation environment containing `fake_proxy_shop`, `fake_seller_store`, `fake_buyer`, and future fake-bank/scenario tools, but the actual tracked workspace contains only `fake-seller-store`. The `packages` directory exists but is empty.

The local checkout also contains generated/runtime artifacts that are not part of the tracked source surface:

- `node_modules`
- `apps/fake-seller-store/node_modules`
- `apps/fake-seller-store/.next`
- `logs`
- ignored env files such as `apps/fake-seller-store/.env.local`

`AGENTS.md` defines the fake ecosystem as a secondary validation layer under PG27 authority. It explicitly says PG27 owns runtime semantics, contracts, persistence, registry, CFG, and orchestration. The fake ecosystem is for smoke testing, orchestration verification, redirect/callback simulation, diagnostics validation, and manual scenario validation.

## Repository Structure

Tracked source structure:

- `package.json`: root workspace scripts and TypeScript dev dependency.
- `pnpm-workspace.yaml`: includes `apps/*` and `packages/*`.
- `tsconfig.base.json`: strict shared TypeScript settings, but the app does not extend it.
- `AGENTS.md`: governance and role documentation.
- `README.md`: high-level fake ecosystem intent.
- `run-phase3-scenario-matrix.mjs`: Phase 3 sale-node path smoke matrix.
- `run-scenario-matrix.sh`: older scenario matrix shell runner targeting `fake-proxy-shop`.
- `apps/fake-seller-store`: only implemented app.
- `apps/fake-seller-store/src/app/page.tsx`: manual order-entry UI.
- `apps/fake-seller-store/src/app/api/create-order/route.ts`: server-side sale-node submission route.
- `apps/fake-seller-store/src/app/order/success/page.tsx`: static success landing page.
- `apps/fake-seller-store/src/app/order/fail/page.tsx`: static failure landing page.
- `apps/fake-seller-store/scripts/fake-seller-to-sale-node-phase3.mjs`: app-level smoke script.
- `apps/fake-seller-store/public/*.svg`: default create-next-app assets, not used by the active UI.

The root `.gitignore` ignores `.env.local`, `.next`, `node_modules`, `dist`, and logs. The app `.gitignore` ignores all `.env*`, `next-env.d.ts`, `.next`, build output, and package-manager debug files.

## Framework and Dependencies

Package manager:

- pnpm, declared as `pnpm@11.0.9`.
- `.npmrc` sets `ignore-scripts=true`.
- Root `pnpm.onlyBuiltDependencies` allows `sharp` and `unrs-resolver`.

Root dependencies:

- Dev dependency only: `typescript`.

`fake-seller-store` dependencies:

- `next` `16.2.6`
- `react` `19.2.4`
- `react-dom` `19.2.4`

`fake-seller-store` dev dependencies:

- Tailwind CSS 4 via `tailwindcss` and `@tailwindcss/postcss`
- ESLint 9 with `eslint-config-next`
- TypeScript 5
- React and Node type packages

The app uses the Next.js App Router. The root page is a client component. API handling uses a route handler under `src/app/api/create-order/route.ts`.

`next.config.ts` configures Turbopack root as the workspace root two levels above the app. This is a workspace-specific assumption.

## UI Flows

Main page: `/`

- Presents six hard-coded seller shops.
- Lets the operator choose buyer type: `b2c`, `b2b`, or `b2g`.
- Lets the operator edit buyer identity/contact/address fields.
- Lets the operator edit an itemized order.
- Calculates client-side total from item `quantity * price`.
- Lets the operator set currency: `RUB`, `USD`, or `EUR`.
- Shows delivery options and a flow panel.
- Submits an HTML form to `/api/create-order` with `method="post"`.

Success page: `/order/success`

- Reads `external_order_id` and `payment_attempt_id` from search params.
- Displays a static success message.
- Provides a link back to `/`.

Failure page: `/order/fail`

- Reads `external_order_id` from search params.
- Displays a static failure message.
- Provides a link back to `/`.

UI mismatch:

- The flow panel says the order is submitted through `fake_proxy_shop`, then PG27 runtime creates buyer action and payment-result waits.
- The implemented API route posts directly to `SALE_NODE_URL/seller-api/sales`.
- This indicates the UI copy is older than the Phase 3 sale-node intake implementation.

## API Routes

Implemented route:

- `POST /api/create-order`

Behavior:

- Reads `FormData`.
- Generates `external_order_id` as `ORD-${Date.now()}`.
- Reads `SALE_NODE_URL`, defaulting to `http://127.0.0.1:3013`.
- Requires `FAKE_SELLER_CONNECT_PUBLIC_ID`; if absent, returns HTTP 500 with `fake_seller_connect_public_id_missing`.
- Builds item lines from repeated `item_name`, `item_quantity`, and `item_price` fields.
- Filters out item lines whose computed `line_total` is not greater than zero.
- Builds buyer name from last, first, and middle name.
- Posts JSON to `${SALE_NODE_URL}/seller-api/sales`.
- On sale-node error, returns a JSON wrapper with `sale_node_seller_api_failed`.
- If the request `Accept` header includes `application/json`, returns sale-node JSON plus `ok: true` and `sale_node_url`.
- Otherwise redirects to `/order/success` with `external_order_id`, `request_id`, and `handoff_validation_status`.

There are no callback/webhook API routes in this app. There is no persistence layer in this repository.

## Data Models

There are no formal shared schemas, database models, ORM models, or generated types. Data models are implicit in local TypeScript types, form field names, and JSON payload construction.

Local UI model:

- `SELLER_SHOPS`: hard-coded seller shop records with `id`, `proxy`, `name`, `url`, `tariff`, and preferred payment `method`.
- `Item`: `{ name: string; quantity: number; price: number }`.
- `DEFAULT_ITEMS`: two hard-coded starter items.

Submitted sale-node payload shape:

- `connect_public_id`
- `external_order_id`
- `request_source: "seller_api"`
- `buyer`: includes generated `buyer_id`, name, type, email, phone, country, address, and postal code.
- `order`: description, item list, currency, and empty metadata.
- `delivery`: required flag, period days, expected date as `null`, and confirmation-required flag.
- `preferences`: payment preference, payment point form/transport preference, and confirmation method.
- `metadata`: flags identifying the fake ecosystem, selected `seller_shop_id`, and return URLs.

Item values are serialized as strings for `unit_price` and `line_total` using `toFixed(2)`. Quantity remains numeric.

The smoke scripts assert sale-node response fields:

- `status === "accepted"`
- `request_id` is present
- `handoff_status === "prepared"`
- `handoff_validation_status === "valid"`

## Environment Configuration

Active app env usage:

- `SALE_NODE_URL`: optional; defaults to `http://127.0.0.1:3013`.
- `FAKE_SELLER_CONNECT_PUBLIC_ID`: required by `/api/create-order`.

App-level env files found locally:

- `apps/fake-seller-store/.env.example`
- `apps/fake-seller-store/.env.local`

Both define:

- `SALE_NODE_URL=http://127.0.0.1:3013`
- `FAKE_SELLER_CONNECT_PUBLIC_ID=92915001`

`.env.example` also documents a legacy Phase 2 proxy URL:

- `LEGACY_FAKE_PROXY_SHOP_URL=http://localhost:3010`

Top-level Phase 3 matrix env usage:

- `CORE_PAPI_URL`, default `http://127.0.0.1:3001`
- `SALE_NODE_URL`, default `http://127.0.0.1:3013`
- `FAKE_SELLER_STORE_URL`, default `http://127.0.0.1:3011`
- `FAKE_SELLER_CONNECT_PUBLIC_ID`, default `92915001`

Older shell scenario matrix env usage:

- `CORE_API_URL`, default `http://localhost:3000`
- `SCENARIO_MODE`

The app `dev` script starts Next on port `3011`.

## External Dependencies

Runtime/service dependencies:

- sale-node service exposing `POST /seller-api/sales`, expected at `SALE_NODE_URL`.
- A valid PG27 connect represented by `FAKE_SELLER_CONNECT_PUBLIC_ID`.
- For matrix tests, a core PAPI service expected at `CORE_PAPI_URL`.
- For local manual UI use, a browser and Next.js dev server on port `3011`.

Tooling dependencies:

- Node.js with global `fetch` and `FormData`, required by the smoke scripts.
- pnpm.
- Next.js/Turbopack.
- Tailwind/PostCSS.
- ESLint.

Historical/stale dependencies:

- `run-scenario-matrix.sh` calls `pnpm --filter fake-proxy-shop scenario`, but no `fake-proxy-shop` package is present in the tracked workspace.
- README and AGENTS mention fake-proxy-shop, fake buyer, fake bank, and multiple scenario runners that are not present in the current tracked tree.

## Hidden Assumptions

- `SALE_NODE_URL` is reachable from the Next.js server runtime.
- `FAKE_SELLER_CONNECT_PUBLIC_ID` is already seeded and active in PG27/sale-node.
- The hard-coded public id `92915001` remains valid in the local PG27 data set.
- `request.nextUrl.origin` is the correct externally reachable seller-store URL for return URLs.
- Sale-node accepts `unit_price` and `line_total` as fixed-point strings.
- Sale-node accepts numeric `quantity`.
- Sale-node accepts empty `order.metadata`.
- Sale-node accepts `delivery_expected_at: null`.
- Sale-node returns JSON for both success and error responses; the route unconditionally calls `response.json()`.
- Search params in success/failure pages are sufficient to show final order state; there is no follow-up status fetch.
- The UI `defaultChecked={buyerType !== "b2c"}` delivery checkboxes update on buyer-type changes. In React uncontrolled inputs, this only affects initial render, so the displayed checkbox state can diverge from later buyer-type changes.
- `external_order_id` and generated buyer ids based on `Date.now()` are collision-resistant enough for local smoke usage.
- The app can run with ignored local env files; there is no committed env validation or startup check.
- `apps/fake-seller-store/README.md` still assumes default Next.js port `3000`, while the package script uses `3011`.
- The app-level TypeScript config does not extend `tsconfig.base.json`, so shared compiler settings are not actually enforced through inheritance.

## Reusable Parts

- The Phase 3 seller-store order route is reusable as a compact adapter from local seller form data to the sale-node seller API contract.
- The sale-node payload construction is explicit and easy to compare with PG27 contract expectations.
- The main page is useful for manual seller-order scenario setup.
- The `run-phase3-scenario-matrix.mjs` script is reusable for validating allowed Phase 3 sale-node intake and rejected legacy fields.
- The app-level smoke script is reusable for JSON-mode order creation verification.
- Hard-coded seller shop fixtures are reusable as local test data, provided they remain clearly non-authoritative.
- `AGENTS.md` is useful governance for keeping this repository secondary to PG27.
- `.env.example` documents the minimum active app configuration.

## Deprecated Assumptions

- The old `fake-proxy-shop` scenario path appears deprecated in this checkout. The shell matrix still targets it, but the package is absent.
- `LEGACY_FAKE_PROXY_SHOP_URL` is explicitly marked legacy Phase 2 and not used by default for Phase 3 sale-node intake.
- The UI copy still describes fake-proxy-shop in the active checkout flow, but the API route uses sale-node directly.
- Root README describes fake actors that are not implemented in the current tracked tree.
- App README is the default create-next-app README and does not reflect the real port, env vars, sale-node dependency, or smoke flow.
- AGENTS mentions tracked scenario files `run-scenario-matrix.mjs` and `run-scenario-matrix-ext.sh`, but they are not present.
- `CORE_API_URL` in the old shell matrix and `CORE_PAPI_URL` in the Phase 3 matrix name different core endpoints; this split looks historical and should not be treated as one canonical env contract.

## Migration Risks

- Contract drift risk: there is no local schema validation for the sale-node payload. If PG27 changes `seller-api/sales`, failures will appear only at runtime.
- Env drift risk: the app requires `FAKE_SELLER_CONNECT_PUBLIC_ID`, while the Phase 3 matrix supplies a default. Manual app use can fail despite matrix defaults.
- Service availability risk: the app is tightly coupled to local sale-node on port `3013`.
- Return URL risk: return URLs are derived from request origin, which may be wrong behind proxies, tunnels, containers, or hosted environments.
- Error handling risk: non-JSON sale-node failures will throw inside `/api/create-order` instead of returning the structured error wrapper.
- Data integrity risk: item quantity and price parsing accepts any finite number from form data; negative quantities are not explicitly rejected server-side.
- UX accuracy risk: delivery checkboxes are uncontrolled and may not reflect buyer-type changes after initial render.
- Documentation risk: README files and UI text describe stale paths, ports, and actors.
- Test risk: the old scenario shell script targets a missing package and may mislead migration work.
- Authority risk: hard-coded seller shops, tariffs, payment methods, and connect public id can be mistaken for canonical PG27 data if not clearly bounded as fixtures.
- Workspace risk: `packages/*` is included but empty, which may cause future migration work to assume package boundaries that do not exist.

## Unknowns

- Exact PG27 `seller-api/sales` authoritative schema and whether every field sent here is still valid.
- Whether public connect id `92915001` is intentionally stable or just a local seed artifact.
- Whether sale-node expects return URLs inside `metadata.return_urls` or another canonical location.
- Whether the success/failure pages should eventually consume callbacks, webhooks, or status polling.
- Whether fake-proxy-shop, fake buyer, and fake bank moved to another repository or were never implemented here.
- Whether logs under `logs` represent current expected behavior or historical outputs.
- Minimum supported Node.js version is not declared.
- Deployment target is not defined; current assumptions are local development only.
- Whether `tsconfig.base.json` is intended to be used by the app or is leftover workspace scaffolding.
- Whether currencies beyond `RUB` are valid in the current PG27/sale-node configuration.

## Summary

The removed legacy implementation is best understood as a local fake seller-store smoke harness, not a complete fake commerce ecosystem. The active path was seller-store UI or smoke script to `POST /api/create-order`, then server-side submission to a legacy checkout backend. The strongest reusable assets were the explicit adapter payload, manual order UI, and smoke matrix. The main cleanup/migration concern was stale proxy-era documentation and scripts that no longer matched the implemented code.

AUDIT COMPLETE
