import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "src/storage/seed.ts",
  "src/storage/local-demo-boundary.ts",
  "src/features/developer-experience/developer-experience-page.tsx",
  "src/integrations/checkout/mock-checkout-adapter.ts",
  "src/integrations/checkout/external-checkout-adapter.ts",
  "src/app/developer/page.tsx",
];

const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const requiredScripts = ["dev", "build", "check", "demo:check", "smoke:routes"];

const missingFiles = requiredFiles.filter((file) => !existsSync(resolve(root, file)));
const missingScripts = requiredScripts.filter((script) => !packageJson.scripts?.[script]);

const seedSource = readFileSync(resolve(root, "src/storage/seed.ts"), "utf8");
const boundarySource = readFileSync(resolve(root, "src/storage/local-demo-boundary.ts"), "utf8");

const requiredSeedMarkers = [
  "createDemoSeed",
  "sample-market",
  "sample-product-notebook",
  "sample-order-success",
  "sample-checkout-session-success",
  "demoCheckoutScenarios",
];

const missingSeedMarkers = requiredSeedMarkers.filter((marker) => !seedSource.includes(marker));
const missingBoundaryMarkers = [
  "inspectLocalDemoState",
  "resetLocalDemoState",
  "reseedLocalDemoState",
].filter((marker) => !boundarySource.includes(marker));

const failures = [
  ...missingFiles.map((file) => `Missing required file: ${file}`),
  ...missingScripts.map((script) => `Missing package script: ${script}`),
  ...missingSeedMarkers.map((marker) => `Missing demo seed marker: ${marker}`),
  ...missingBoundaryMarkers.map((marker) => `Missing storage boundary marker: ${marker}`),
];

if (failures.length > 0) {
  console.error("Demo foundation check failed.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Demo foundation check passed.");
console.log("Run `pnpm run dev` and open `/developer` to load or reset sample demo data.");
