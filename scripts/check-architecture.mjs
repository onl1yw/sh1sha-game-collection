import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const SOURCE_ROOT = join(ROOT, "src");
const CODE_EXTENSIONS = new Set([".ts", ".tsx"]);
const LEGACY_STORAGE_ALLOWLIST = new Set([
  "src/games/spy/infrastructure/storage/legacySpyStorage.ts",
]);

const files = await collectCodeFiles(SOURCE_ROOT);
const gameStyleFiles = await collectStyleFiles(join(SOURCE_ROOT, "games"));
const violations = [];
const gameModules = new Map();
const gameModulePaths = [];
const importsByPath = new Map();

for (const file of files) {
  const projectPath = projectPathFor(file);
  const source = await readFile(file, "utf8");
  const imports = importedSpecifiers(source, file).map((entry) => ({
    ...entry,
    target: resolveImport(file, entry.specifier),
  }));
  importsByPath.set(projectPath, imports);

  checkSharedBoundary(projectPath, imports);
  checkPlatformBoundary(projectPath, imports);
  checkGameBoundary(projectPath, imports, source);
  registerGameModule(projectPath);
}

for (const file of gameStyleFiles) {
  const projectPath = projectPathFor(file);
  const source = await readFile(file, "utf8");
  if (!projectPath.endsWith(".module.css")) {
    violations.push(`${projectPath}: game styles must use CSS modules`);
  }
  if (/:global\b/.test(source)) {
    violations.push(`${projectPath}: game CSS modules cannot escape with :global`);
  }
}

gameModulePaths.forEach(checkDescriptorStaticClosure);

for (const [gameId, count] of gameModules) {
  if (count !== 1) {
    violations.push(`src/games/${gameId}: expected one gameModule.ts, found ${count}`);
  }
}

if (violations.length > 0) {
  console.error(`Architecture violations:\n${violations.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${files.length} source files and ${gameModules.size} game module: boundaries are clean.`,
  );
}

function checkSharedBoundary(projectPath, imports) {
  if (!projectPath.startsWith("src/shared/")) return;
  imports.forEach(({ specifier, target }) => {
    if (
      target?.startsWith("src/app/") ||
      target?.startsWith("src/features/") ||
      target?.startsWith("src/games/")
    ) {
      violations.push(`${projectPath}: shared cannot import ${specifier}`);
    }
  });
}

function checkPlatformBoundary(projectPath, imports) {
  const isPlatform = projectPath.startsWith("src/app/") ||
    projectPath.startsWith("src/features/");
  if (!isPlatform) return;
  imports.forEach(({ specifier, target }) => {
    if (target?.startsWith("src/games/")) {
      violations.push(`${projectPath}: platform cannot import a concrete game (${specifier})`);
    }
  });
}

function checkGameBoundary(projectPath, imports, source) {
  const match = projectPath.match(/^src\/games\/([^/]+)\/(.+)$/);
  if (!match?.[1] || !match[2]) return;
  const gameId = match[1];
  const localPath = match[2];
  const isModuleBoundary = !localPath.includes("/");
  const isCompositionRoot = /(^|\/)[A-Z][A-Za-z0-9]*Provider\.tsx$/.test(
    localPath,
  );
  const gameRoot = `src/games/${gameId}/`;

  imports.forEach(({ specifier, target }) => {
    const otherGame = target?.match(/^src\/games\/([^/]+)\//)?.[1];
    if (otherGame && otherGame !== gameId) {
      violations.push(`${projectPath}: games cannot import ${otherGame} (${specifier})`);
    }
    if (target?.startsWith("src/app/") && (
      !isModuleBoundary || target !== "src/app/gameModule.ts"
    )) {
      violations.push(
        `${projectPath}: games may import only the public game-module contract (${specifier})`,
      );
    }
    if (target?.endsWith(".css") && !target.endsWith(".module.css")) {
      violations.push(`${projectPath}: game styles must be scoped (${specifier})`);
    }
    if (localPath.startsWith("domain/") && isForbiddenDomainImport(target, specifier)) {
      violations.push(`${projectPath}: domain must stay pure (${specifier})`);
    }
    if (localPath.startsWith("features/") && target?.includes("/infrastructure/")) {
      violations.push(`${projectPath}: game UI cannot import infrastructure (${specifier})`);
    }
    if (
      localPath.startsWith("app/") &&
      target?.includes("/infrastructure/") &&
      !isCompositionRoot
    ) {
      violations.push(`${projectPath}: concrete adapters belong in the game composition root`);
    }
  });

  if (localPath === "gameModule.ts") {
    const eagerGameImports = imports.filter(({ kind, target }) =>
      kind === "static" && target?.startsWith(gameRoot) &&
      (target.slice(gameRoot.length).includes("/") || !target.endsWith(".ts"))
    );
    eagerGameImports.forEach(({ specifier }) => {
      violations.push(
        `${projectPath}: descriptor must not eagerly import game code (${specifier})`,
      );
    });

    const lazyEntries = imports.filter(({ kind, target }) =>
      kind === "dynamic" && target?.startsWith(gameRoot)
    );
    if (lazyEntries.length !== 1) {
      violations.push(
        `${projectPath}: descriptor must contain exactly one local dynamic game import`,
      );
    }
  }

  if (localPath.startsWith("domain/") && /\b(window|document|localStorage|fetch)\b/.test(source)) {
    violations.push(`${projectPath}: domain references a browser API`);
  }
  if (
    !LEGACY_STORAGE_ALLOWLIST.has(projectPath) &&
    /\b(?:localStorage|sessionStorage)\b/.test(source)
  ) {
    violations.push(
      `${projectPath}: games must use storage supplied by the platform`,
    );
  }
}

function isForbiddenDomainImport(target, specifier) {
  return specifier === "react" ||
    Boolean(target?.includes("/app/")) ||
    Boolean(target?.includes("/features/")) ||
    Boolean(target?.includes("/infrastructure/")) ||
    Boolean(target?.startsWith("src/app/"));
}

function registerGameModule(projectPath) {
  const match = projectPath.match(/^src\/games\/([^/]+)\/(.+)$/);
  if (!match?.[1]) return;
  const gameId = match[1];
  if (!gameModules.has(gameId)) gameModules.set(gameId, 0);
  if (match[2] === "gameModule.ts") {
    gameModules.set(gameId, (gameModules.get(gameId) ?? 0) + 1);
    gameModulePaths.push(projectPath);
  }
}

function checkDescriptorStaticClosure(modulePath) {
  const gameId = modulePath.match(/^src\/games\/([^/]+)\//)?.[1];
  if (!gameId) return;
  const gameRoot = `src/games/${gameId}/`;
  const pending = [modulePath];
  const visited = new Set();

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);

    const localImports = importsByPath.get(current) ?? [];
    for (const { kind, specifier, target } of localImports) {
      if (kind !== "static" || !target?.startsWith(gameRoot)) continue;
      const relativeTarget = target.slice(gameRoot.length);
      if (relativeTarget.includes("/") || !target.endsWith(".ts")) {
        violations.push(
          `${modulePath}: eager dependency chain reaches ${specifier} via ${current}`,
        );
        continue;
      }
      pending.push(target);
    }
  }
}

function importedSpecifiers(source, file) {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const specifiers = [];
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push({ kind: "static", specifier: node.moduleSpecifier.text });
    }
    if (
      ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] && ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push({ kind: "dynamic", specifier: node.arguments[0].text });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return specifiers;
}

function resolveImport(file, specifier) {
  if (!specifier.startsWith(".")) return null;
  const target = resolve(dirname(file), specifier);
  const candidates = [
    target,
    `${target}.ts`,
    `${target}.tsx`,
    `${target}.js`,
    `${target}.css`,
    join(target, "index.ts"),
    join(target, "index.tsx"),
  ];
  return projectPathFor(candidates.find((candidate) => existsSync(candidate)) ?? target);
}

function projectPathFor(file) {
  return normalize(relative(ROOT, file)).replaceAll("\\", "/");
}

async function collectCodeFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectCodeFiles(path);
    return CODE_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
  }));
  return nested.flat();
}

async function collectStyleFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectStyleFiles(path);
    return extname(entry.name) === ".css" ? [path] : [];
  }));
  return nested.flat();
}
