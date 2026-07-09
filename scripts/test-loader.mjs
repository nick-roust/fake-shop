import { readFileSync, statSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = resolvePath(root, "src");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    return resolveSourceSpecifier(resolvePath(sourceRoot, specifier.slice(2)));
  }

  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const parentPath = context.parentURL ? fileURLToPath(context.parentURL) : root;
    const resolvedPath = resolvePath(dirname(parentPath), specifier);
    const resolved = resolveFilePath(resolvedPath);

    if (resolved) {
      return {
        shortCircuit: true,
        url: pathToFileURL(resolved).href,
      };
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    const source = readFileSync(fileURLToPath(url), "utf8");
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        jsx: ts.JsxEmit.Preserve,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: fileURLToPath(url),
    });

    return {
      format: "module",
      shortCircuit: true,
      source: transpiled.outputText,
    };
  }

  return nextLoad(url, context);
}

function resolveSourceSpecifier(path) {
  const resolved = resolveFilePath(path);

  if (!resolved) {
    throw new Error(`Unable to resolve test import: ${path}`);
  }

  return {
    shortCircuit: true,
    url: pathToFileURL(resolved).href,
  };
}

function resolveFilePath(path) {
  const candidates = [
    path,
    `${path}.ts`,
    `${path}.tsx`,
    `${path}.js`,
    `${path}.mjs`,
    resolvePath(path, "index.ts"),
    resolvePath(path, "index.tsx"),
    resolvePath(path, "index.js"),
  ];

  return candidates.find(isFile);
}

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}
