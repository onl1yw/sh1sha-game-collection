# Your first contribution

This guide takes a first-time contributor from a fork to a reviewable pull
request. You can follow it manually or give it to a coding agent.

## 1. Choose a focused change

Good first contributions include:

- fixing one reproducible bug;
- improving one accessible label or keyboard interaction;
- adding tests for existing behavior;
- improving English documentation; or
- adding an original, well-curated Spy theme.

Open or comment on an issue before starting a large new game. This prevents two
contributors from building incompatible versions of the same idea.

Do not submit copied word lists, rulebooks, artwork, or code from paid or closed
games. You must have the right to contribute everything in your pull request.

## 2. Fork and install

Fork the repository on GitHub, then clone your fork:

```bash
git clone https://github.com/YOUR-NAME/sh1sha-game-collection.git
cd sh1sha-game-collection
git remote add upstream https://github.com/onl1yw/sh1sha-game-collection.git
npm ci
npm run check
```

The project requires the Node.js version documented in `.nvmrc` and
`package.json`.

Create a branch with a descriptive name:

```bash
git switch -c feat/add-alias-game
```

## 3. Give an agent the repository contract

If you use Codex, Claude Code, Cursor, or another coding agent, ask it to read
these files before changing code:

1. `AGENTS.md`
2. `CONTRIBUTING.md`
3. `docs/architecture.md`
4. the task-specific guide linked below

Keep the agent on one bounded task. Require it to run `npm run check` and report
the exact files it changed.

## 4. Follow the path for your change

### Existing platform or game

Find the owner under `src/app`, `src/features`, `src/shared`, or
`src/games/<game-id>`. Preserve the dependency boundaries in
`docs/architecture.md`, then add a focused test under `tests/unit`.

### New Spy theme

Follow `docs/adding-a-theme.md`. Theme data is validated separately from game
code, and every submitted item must be original or safely reusable.

### New game

Read `docs/adding-a-game.md`, then generate a minimal module:

```bash
npm run create:game -- --id alias --title "Alias"
```

The command refuses to overwrite existing files. It creates:

- `src/games/alias/gameModule.ts`;
- a lazy root component and scoped CSS module;
- `docs/games/alias.md`; and
- `tests/unit/games/alias.test.tsx`.

The platform discovers the descriptor automatically. The new card appears in
the collection only after you run the generator, and no hidden demo game ships
with the repository.

Replace all scaffold copy with a playable first version. Keep rules, state,
storage adapters, and screens inside the new game's folder.

## 5. Validate while you work

Run a focused test during development:

```bash
npx vitest run tests/unit/games/alias.test.tsx
```

Before committing, run the complete gate:

```bash
npm run check
git diff --check
git status --short
```

Do not bypass architecture, file-size, theme, lint, test, or build failures.
Fix the cause or explain a genuine blocker in the pull request.

## 6. Commit and open the pull request

Use a concise commit message:

```bash
git add --all
git commit -m "Add initial Alias game"
git push -u origin feat/add-alias-game
```

Open a pull request against `onl1yw/sh1sha-game-collection:main`. Complete every
relevant section of the pull request template, including:

- what changed and why;
- how reviewers can verify it;
- which checks you ran;
- screenshots for visible UI changes; and
- the origin and license of contributed content.

CI and review are required before merge. A maintainer may request smaller
commits, stronger tests, accessibility fixes, or proof that submitted content
can be redistributed.

## 7. Respond to review

Push review fixes to the same branch; the pull request updates automatically.
Resolve conversations only after the concern is addressed. Keep the branch
focused rather than adding unrelated cleanup.

Thank you for helping make small party games easier to play and extend.
