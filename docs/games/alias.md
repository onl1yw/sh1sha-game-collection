# Alias

Alias is a phone-hosted word-explanation game for one to eight teams. One
person holds the phone and explains the visible word without saying it. The
team confirms guessed words with the check button or a right swipe; an
unexplainable word can be skipped with the explicit button or a left swipe.

Player-facing copy and bundled word packs are intentionally Russian. Code,
tests, and contributor documentation remain English.

## Implemented scope

- one to eight editable teams with unique names;
- a supported one-team cooperative or two-player mode;
- simultaneous selection of multiple word themes;
- 15, 30, and 60 second presets plus a custom 10–180 second timer;
- free skips or a one-point penalty for every skipped word;
- victory by target score or by the highest score after a fixed number of
  rounds per team;
- a stable ready screen before every timed round;
- an accessible correct button, explicit skip button, and touch/mouse swipe;
- post-round review where every word can be included or excluded with a
  switch before scoring;
- automatic team rotation, score keeping, ties, and final results.

Active sessions are intentionally in memory for this first version. Opening
collection settings does not unmount the game, but a full reload starts a new
Alias setup. A versioned recovery format should be introduced before adding
resume metadata to `gameModule.ts`.

## Game loop

```text
setup teams, themes, timer, scoring, and victory
→ active team receives the phone
→ tap Ready
→ explain, confirm, or skip until time expires
→ review every seen word
→ apply score
→ next team or final results
```

In points mode the game ends immediately after a team reaches the target. In
rounds mode, “rounds” means rounds **per team**: every team receives the same
number of turns before the final ranking. One-team games therefore end when
that team reaches the target or completes its configured rounds.

## Scoring

Every enabled review item is worth `+1`. A disabled item is worth `0` when
skips are free and `-1` when the skip penalty is enabled. The post-round review
is authoritative, so an accidental press or ambiguous guess can be corrected
before the score changes.

## Theme catalog

Alias owns its content under `public/games/alias/themes/`; it never imports
Spy internals or reads Spy files at runtime. Every checked-in Spy pack is copied
one-to-one into an Alias-owned flat explanation deck, including Places; a test
keeps those copies synchronized. Cinema, Physics, and Mathematics are original
Alias packs. No list was copied from a commercial Alias deck.

`manifest.json` controls order, enablement, and sensitivity. Each theme file is:

```json
{
  "schemaVersion": 1,
  "id": "cinema",
  "name": "Кино",
  "description": "Фильмы, профессии, жанры и всё вокруг экрана",
  "words": ["Режиссёр", "Актёр", "Сценарий"]
}
```

A checked-in theme must contain at least ten non-empty, case-insensitively
unique words. Politics and psychoactive-substance packs are marked sensitive
in the manifest and follow the collection preference. Run
`npm run validate:themes` after changing any pack.
Editor schemas live in `schemas/games/alias/`.

## Architecture

```text
src/games/alias/
  domain/           setup constraints, deck, scoring, victory, theme parser
  app/              reducer, module-local actions, screen router, repository port
  features/         setup, ready, timed round, review, and result screens
  infrastructure/   HTTP implementation of the theme repository
```

The domain has no React or browser APIs. Feature screens do not import
infrastructure. The composition root creates the repository and the host
discovers `gameModule.ts` automatically.

## Testing

Focused tests cover deck construction, setup validation, both victory modes,
free and penalized skips, post-round corrections, team rotation, the complete
catalog, and lazy module loading. Before contributing, run:

```bash
npm run check
```
