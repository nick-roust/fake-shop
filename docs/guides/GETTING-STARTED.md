# Getting Started

## Purpose

Help users run fake-shop for the first time.

## Status

Active foundation.

## Docker Quick Start

Docker is the recommended first-run workflow for fake-shop v0.2.0.

Requirement:

- Docker with Compose support.

### 1. Clone the repository

```bash
git clone git@github.com:nick-roust/fake-shop.git
cd fake-shop
```

### 2. Start the local container

Build and start the application:

```bash
docker compose up --build
```

Compose publishes fake-shop only on the host loopback interface.

### 3. Open the application

```text
http://127.0.0.1:3000
```

### 4. Load sample data

Open the developer tools page:

```text
http://127.0.0.1:3000/developer
```

Select `Load sample data`. Sample data is loaded only through this browser workflow; starting the
container does not seed or modify application state.

### 5. Follow the sample shop flow

Use the links on the developer tools page to inspect:

1. the sample shop;
2. its products;
3. checkout preparation;
4. orders;
5. integration settings.

### 6. Run mock checkout

Open the sample checkout route, review or add cart contents, enter customer information, prepare
checkout, and select a mock success, failure, or cancellation result. Then inspect the order and
checkout session status.

Mock checkout is the default. The complete first-run flow requires no database, external service,
credentials, or state volume. Shop, demo, and checkout state remains in the browser's
`localStorage`.

The container health endpoint at `http://127.0.0.1:3000/api/health` reports only web-runtime
availability. It does not read or modify browser-local state or validate checkout integrations.

## Native Contributor Setup

Contributors who want the native development server need:

- Node.js 22.13 or newer;
- pnpm 11 or newer.

Check versions:

```bash
node --version
pnpm --version
```

After cloning the repository, install dependencies and start the development server:

```bash
pnpm install
pnpm run dev
```

Open:

```text
http://localhost:3000
```

Native and Docker workflows run the same application behavior. Docker packaging does not change
`localStorage` persistence, mock checkout, or the provider-neutral checkout adapter boundary.

## Validation

Run:

```bash
pnpm run check
pnpm run test
pnpm run build
```
