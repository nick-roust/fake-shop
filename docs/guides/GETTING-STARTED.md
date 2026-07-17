# Getting Started

## Purpose

Help users run fake-shop for the first time.

## Status

Active foundation.

## Prerequisites

- Node.js 22.13 or newer.
- pnpm 11 or newer.

Check versions:

```bash
node --version
pnpm --version
```

## Clone

Clone the repository:

```bash
git clone git@github.com:nick-roust/fake-shop.git
cd fake-shop
```

## Install

Install dependencies:

```bash
pnpm install
```

## Run Locally

Start the application:

```bash
pnpm run dev
```

Open:

```text
http://localhost:3000
```

## Run with Docker

Build and start the production application locally:

```bash
docker compose up --build
```

Open:

```text
http://127.0.0.1:3000
```

Compose publishes the application only on the host loopback interface. The container runs the
same local-first application in mock mode by default and does not require a database, external
service, or state volume. Shop, demo, and checkout state remains in the browser's `localStorage`.

Container health reports web-runtime availability at `http://127.0.0.1:3000/api/health`; it does
not inspect or modify browser-local state or validate an external checkout provider.

## First Demo Flow

Open developer tools:

```text
http://localhost:3000/developer
```

Select `Load sample data`, then follow the demo path links to inspect:

1. sample shop;
2. products;
3. checkout preparation;
4. orders;
5. integration settings.

The developer tools page can also reset local demo data and inspect current local state.

## Mock Checkout Usage

Mock mode is the default checkout mode. It works without external services.

To run a mock checkout manually:

1. Load sample data from `/developer`.
2. Open the sample checkout route.
3. Add or review cart contents.
4. Enter customer information.
5. Prepare checkout.
6. Run a mock result: success, failure, or cancellation.
7. Inspect the order and checkout session status.

## Validation

Run:

```bash
pnpm run check
pnpm run test
pnpm run build
```
