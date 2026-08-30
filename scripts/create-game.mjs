import {
  access,
  mkdir,
  readFile,
  realpath,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIRECTORY = resolve(SCRIPT_DIRECTORY, "../templates/game-module");
const ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const MAX_ID_LENGTH = 48;
const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 160;

const TARGETS = [
  { template: "gameModule.ts.tpl", target: ({ id }) => `src/games/${id}/gameModule.ts` },
  {
    template: "Game.tsx.tpl",
    target: ({ id, component }) => `src/games/${id}/${component}Game.tsx`,
  },
  {
    template: "Game.module.css.tpl",
    target: ({ id, component }) => `src/games/${id}/${component}Game.module.css`,
  },
  { template: "game.md.tpl", target: ({ id }) => `docs/games/${id}.md` },
  { template: "game.test.tsx.tpl", target: ({ id }) => `tests/unit/games/${id}.test.tsx` },
];

export function parseArguments(args) {
  const values = new Map();

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") return { help: true };
    if (!argument?.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${argument ?? ""}`);
    }

    const equalsIndex = argument.indexOf("=");
    const name = argument.slice(2, equalsIndex === -1 ? undefined : equalsIndex);
    if (!["id", "title", "description"].includes(name)) {
      throw new Error(`Unknown option: --${name}`);
    }
    if (values.has(name)) throw new Error(`Option --${name} was provided twice`);

    const inlineValue = equalsIndex === -1 ? undefined : argument.slice(equalsIndex + 1);
    const nextValue = inlineValue ?? args[index + 1];
    if (!nextValue || (inlineValue === undefined && nextValue.startsWith("--"))) {
      throw new Error(`Option --${name} requires a value`);
    }
    values.set(name, nextValue);
    if (inlineValue === undefined) index += 1;
  }

  const id = values.get("id");
  const title = values.get("title");
  if (!id) throw new Error("Missing required option: --id");
  if (!title) throw new Error("Missing required option: --title");

  return normalizeOptions({
    id,
    title,
    description: values.get("description"),
  });
}

export async function scaffoldGame(options, root = process.cwd()) {
  const normalized = normalizeOptions(options);
  const repositoryRoot = resolve(root);
  await assertRepositoryRoot(repositoryRoot);

  const context = {
    ...normalized,
    component: componentName(normalized.id),
  };
  const outputs = TARGETS.map((target) => ({
    ...target,
    relativePath: target.target(context),
  }));

  const protectedPaths = [
    `src/games/${context.id}`,
    ...outputs.map(({ relativePath }) => relativePath),
  ];
  const existing = [];
  for (const relativePath of protectedPaths) {
    if (await pathExists(join(repositoryRoot, relativePath))) existing.push(relativePath);
  }
  if (existing.length > 0) {
    throw new Error(`Refusing to overwrite existing target:\n${existing.join("\n")}`);
  }

  const rendered = await Promise.all(outputs.map(async (output) => {
    const source = await readFile(join(TEMPLATE_DIRECTORY, output.template), "utf8");
    return { ...output, source: renderTemplate(source, context) };
  }));

  const destinationDirectories = [
    ...new Set(rendered.map(({ relativePath }) =>
      dirname(join(repositoryRoot, relativePath))
    )),
  ];
  const createdDirectories = [];
  const createdFiles = [];
  try {
    for (const directory of destinationDirectories) {
      if (!(await pathExists(directory))) createdDirectories.push(directory);
      await mkdir(directory, { recursive: true });
    }
    for (const output of rendered) {
      const destination = join(repositoryRoot, output.relativePath);
      await writeFile(destination, output.source, { encoding: "utf8", flag: "wx" });
      createdFiles.push(destination);
    }
  } catch (error) {
    await rollback(createdFiles, createdDirectories);
    throw error;
  }

  return rendered.map(({ relativePath }) => relativePath);
}

function normalizeOptions({ id, title, description }) {
  const normalizedId = String(id ?? "").trim();
  const normalizedTitle = cleanText(title, "title", MAX_TITLE_LENGTH);
  const normalizedDescription = description === undefined
    ? `A new pass-and-play implementation of ${normalizedTitle}.`
    : cleanText(description, "description", MAX_DESCRIPTION_LENGTH);

  if (!ID_PATTERN.test(normalizedId) || normalizedId.length > MAX_ID_LENGTH) {
    throw new Error(
      `Game id must be kebab-case, start with a letter, and contain at most ${MAX_ID_LENGTH} characters`,
    );
  }

  return {
    id: normalizedId,
    title: normalizedTitle,
    description: normalizedDescription,
  };
}

function cleanText(value, label, maximumLength) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`Game ${label} cannot be empty`);
  if (text.length > maximumLength) {
    throw new Error(`Game ${label} must contain at most ${maximumLength} characters`);
  }
  if (/\p{Cc}/u.test(text)) throw new Error(`Game ${label} cannot contain control characters`);
  return text;
}

function componentName(id) {
  return id.split("-")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join("");
}

function renderTemplate(source, context) {
  const replacements = new Map([
    ["__GAME_ID__", context.id],
    ["__GAME_ID_JSON__", JSON.stringify(context.id)],
    ["__GAME_TITLE_JSON__", JSON.stringify(context.title)],
    ["__GAME_DESCRIPTION_JSON__", JSON.stringify(context.description)],
    ["__GAME_COMPONENT__", context.component],
    ["__GAME_TITLE_MARKDOWN__", escapeMarkdown(context.title)],
    ["__GAME_DESCRIPTION_MARKDOWN__", escapeMarkdown(context.description)],
  ]);

  let rendered = source;
  for (const [placeholder, value] of replacements) {
    rendered = rendered.replaceAll(placeholder, value);
  }
  const unresolved = rendered.match(/__GAME_[A-Z_]+__/g);
  if (unresolved) throw new Error(`Unresolved template value: ${unresolved[0]}`);
  return rendered;
}

function escapeMarkdown(value) {
  return value.replace(/[\\`*_[\]<>]/g, "\\$&");
}

async function assertRepositoryRoot(root) {
  const sentinels = ["package.json", "src/app/gameModule.ts"];
  for (const sentinel of sentinels) {
    if (!(await pathExists(join(root, sentinel)))) {
      throw new Error(`Run this command from the repository root (missing ${sentinel})`);
    }
  }
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") return false;
    throw error;
  }
}

async function rollback(files, directories) {
  for (const file of files.reverse()) {
    try {
      await unlink(file);
    } catch {
      // Preserve the original scaffold error; cleanup is best-effort.
    }
  }
  for (const directory of directories.sort((a, b) => b.length - a.length)) {
    try {
      await rmdir(directory);
    } catch {
      // Never remove non-empty or concurrently modified directories.
    }
  }
}

function helpText() {
  return [
    "Create a lazy-loaded game module without editing the central registry.",
    "",
    "Usage:",
    "  npm run create:game -- --id alias --title \"Alias\"",
    "",
    "Options:",
    "  --id           Required kebab-case module id",
    "  --title        Required display title",
    "  --description  Optional catalog description",
    "  --help, -h     Show this help",
  ].join("\n");
}

async function runCli() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      console.log(helpText());
      return;
    }
    const files = await scaffoldGame(options);
    console.log(`Created game module "${options.id}":`);
    files.forEach((file) => console.log(`  ${file}`));
    console.log("\nNext: replace scaffold copy, add game rules, then run npm run check.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

async function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    const [executedPath, modulePath] = await Promise.all([
      realpath(resolve(process.argv[1])),
      realpath(fileURLToPath(import.meta.url)),
    ]);
    return executedPath === modulePath;
  } catch {
    return false;
  }
}

if (await isMainModule()) await runCli();
