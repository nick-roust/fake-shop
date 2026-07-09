import { readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const testsRoot = resolve(root, "tests");
const requestedGroup = process.argv[2];
const testFiles = listTestFiles(requestedGroup ? join(testsRoot, requestedGroup) : testsRoot);

if (testFiles.length === 0) {
  console.error("No test files found.");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--import", resolve(root, "scripts/register-test-loader.mjs"), "--test", ...testFiles],
  {
    cwd: root,
    stdio: "inherit",
  }
);

process.exit(result.status ?? 1);

function listTestFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return listTestFiles(path);
    }

    if (entry.isFile() && entry.name.endsWith(".test.ts")) {
      return [relative(root, path)];
    }

    return [];
  });
}
