import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = fileURLToPath(
  new URL("../../scripts/create-game.mjs", import.meta.url),
);
const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) =>
    rm(root, { recursive: true, force: true })
  ));
});

describe("create-game script", () => {
  it("creates a lazy module, root screen, styles, documentation, and test", async () => {
    const root = await createRepositoryRoot();
    const result = run(root, [
      "--id",
      "two-truths",
      "--title",
      "Two Truths",
      "--description",
      "Find the invented answer.",
    ]);

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('Created game module "two-truths"');

    const expected = [
      "src/games/two-truths/gameModule.ts",
      "src/games/two-truths/TwoTruthsGame.tsx",
      "src/games/two-truths/TwoTruthsGame.module.css",
      "docs/games/two-truths.md",
      "tests/unit/games/two-truths.test.tsx",
    ];
    for (const path of expected) {
      expect(await readFile(join(root, path), "utf8")).not.toHaveLength(0);
    }

    const descriptor = await readFile(join(root, expected[0] ?? ""), "utf8");
    expect(descriptor).toContain('id: "two-truths"');
    expect(descriptor).toContain('load: () => import("./TwoTruthsGame")');
    expect(descriptor).not.toContain("gameRegistry");

    const component = await readFile(join(root, expected[1] ?? ""), "utf8");
    expect(component).toContain("GameHostProps");
    expect(component).toContain("TwoTruthsGame.module.css");
  });

  it("supports the documented minimal command and derives safe defaults", async () => {
    const root = await createRepositoryRoot();
    const result = run(root, ["--id", "alias", "--title", "Alias"]);

    expect(result.status, result.stderr).toBe(0);
    const descriptor = await readFile(
      join(root, "src/games/alias/gameModule.ts"),
      "utf8",
    );
    expect(descriptor).toContain("A new pass-and-play implementation of Alias.");
  });

  it.skipIf(process.platform === "win32")(
    "runs when invoked through an absolute symbolic link",
    async () => {
      const root = await createRepositoryRoot();
      const linkedScript = join(root, "create-game-link.mjs");
      await symlink(SCRIPT, linkedScript);

      const result = run(root, ["--id", "alias", "--title", "Alias"], linkedScript);

      expect(result.status, result.stderr).toBe(0);
      expect(await readFile(join(root, "src/games/alias/gameModule.ts"), "utf8"))
        .toContain('id: "alias"');
    },
  );

  it("uses JSON string literals for titles containing quotes and backslashes", async () => {
    const root = await createRepositoryRoot();
    const title = 'Back\\slash "Deluxe"';
    const result = run(root, ["--id", "escaped-title", "--title", title]);

    expect(result.status, result.stderr).toBe(0);
    const generatedTest = await readFile(
      join(root, "tests/unit/games/escaped-title.test.tsx"),
      "utf8",
    );
    expect(generatedTest).toContain(`${JSON.stringify(title)} + " game module"`);
    expect(generatedTest).not.toContain("__GAME_TITLE_TEST__");
  });

  it.each([
    "Alias",
    "two_truths",
    "../escape",
    "2-fast",
    "trailing-",
  ])("rejects unsafe or non-kebab-case id %s without writing files", async (id) => {
    const root = await createRepositoryRoot();
    const result = run(root, ["--id", id, "--title", "Example"]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Game id must be kebab-case");
    await expect(readFile(join(root, "docs/games/escape.md"), "utf8"))
      .rejects.toMatchObject({ code: "ENOENT" });
  });

  it("refuses an existing game without changing its files", async () => {
    const root = await createRepositoryRoot();
    const gameDirectory = join(root, "src/games/alias");
    await mkdir(gameDirectory, { recursive: true });
    await writeFile(join(gameDirectory, "README.txt"), "keep me\n");

    const result = run(root, ["--id", "alias", "--title", "Alias"]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Refusing to overwrite existing target");
    expect(await readFile(join(gameDirectory, "README.txt"), "utf8")).toBe("keep me\n");
  });

  it.skipIf(process.platform === "win32")(
    "rolls back files when a later destination cannot be written",
    async () => {
      const root = await createRepositoryRoot();
      const docsDirectory = join(root, "docs/games");
      await mkdir(docsDirectory, { recursive: true });
      await chmod(docsDirectory, 0o500);

      const result = run(root, ["--id", "alias", "--title", "Alias"]);
      await chmod(docsDirectory, 0o700);

      expect(result.status).toBe(1);
      await expect(readFile(join(root, "src/games/alias/gameModule.ts"), "utf8"))
        .rejects.toMatchObject({ code: "ENOENT" });
      await expect(readFile(join(root, "tests/unit/games/alias.test.tsx"), "utf8"))
        .rejects.toMatchObject({ code: "ENOENT" });
    },
  );

  it("reports missing and unknown options", async () => {
    const root = await createRepositoryRoot();

    expect(run(root, ["--id", "alias"]).stderr)
      .toContain("Missing required option: --title");
    expect(run(root, ["--id", "alias", "--title", "Alias", "--root", "/tmp"]).stderr)
      .toContain("Unknown option: --root");
  });
});

async function createRepositoryRoot() {
  const root = await mkdtemp(join(tmpdir(), "sh1sha-game-generator-"));
  temporaryRoots.push(root);
  await mkdir(join(root, "src/app"), { recursive: true });
  await writeFile(join(root, "package.json"), '{"name":"generator-test"}\n');
  await writeFile(join(root, "src/app/gameModule.ts"), "export {};\n");
  return root;
}

function run(root: string, args: string[], script = SCRIPT) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
  });
}
