# Contributing

Thank you for helping improve sh1sha's game collection. The project welcomes
fixes, new games, new themes, and improvements to shared components.

## Before you start

- You may open a pull request directly for a small, focused fix.
- Propose a new game or a substantial rules change through the relevant issue
  template first. This lets maintainers agree on module boundaries before a
  large implementation begins.
- Read the [guide to adding a game](docs/adding-a-game.md) or the
  [guide to adding a theme](docs/adding-a-theme.md).
- First-time contributors can follow the
  [end-to-end walkthrough](docs/first-contribution.md).
- Discussions and code must follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- Report vulnerabilities through the process in the
  [Security Policy](SECURITY.md), not through a public issue.

## Local validation

```bash
npm ci
npm run check
```

`npm run check` validates architecture and file-size boundaries, linting,
tests, TypeScript, and the production build. A pull request must pass the entire
command.

## Agent-assisted contributions

Pull requests created with Codex, Claude Code, Cursor, or another coding agent
are welcome. Ask the agent to read [AGENTS.md](AGENTS.md) before editing and keep
it on one bounded task.

The contributor who opens the pull request remains responsible for reviewing
the diff, verifying behavior, confirming the origin and license of every added
asset or data set, and reporting validation honestly. Generated code receives
the same review standard as hand-written code. Do not submit an agent's output
without understanding what it changes.

## Change requirements

- Keep each pull request focused on one coherent change and avoid unrelated
  edits.
- Preserve game-module independence: a game must not import another game's
  internals.
- Move an element to `shared` only after it is genuinely reused across multiple
  parts of the platform.
- Do not create files longer than 300 lines. Split components, styles, and
  domain logic by responsibility.
- Add or update tests for rules, state, persistence, and fixed regressions.
- Update documentation whenever a public contract, data format, or contribution
  workflow changes.
- Do not add secrets, personal data, generated build artifacts, or unnecessary
  dependencies.

## Rights to code and content

The project follows **inbound = outbound**: by submitting a contribution, you
agree to license it under the
[PolyForm Noncommercial License 1.0.0](LICENSE), the same terms as the
repository. No separate Contributor License Agreement is required. You retain
authorship of your original contribution.

By submitting code, copy, images, names, word lists, or other material, you
confirm that:

- you created it yourself or have the right to distribute it under the
  project's license;
- you identify the source and license of third-party material in the pull
  request;
- it does not infringe copyright, trademarks, privacy, or other third-party
  rights;
- it does not contain undisclosed advertising, dangerous instructions, or
  personal data.

Do not copy lists or cards from paid or closed commercial games, applications,
or packs. A general game idea or common fact may not be protected by copyright,
but specific text, selection, structure, artwork, and presentation may be.
Create your own wording and collection.

## Pull requests

In the description, explain:

1. what problem the change solves;
2. what changed;
3. how you verified it;
4. whether it adds data, assets, dependencies, or migrations;
5. where added content came from and what rights permit its use.

Maintainers may ask you to split a pull request, adjust its architecture, or
remove material whose provenance cannot be verified.
