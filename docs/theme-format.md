# Theme format

## Location

```text
public/games/spy/themes/
  manifest.json
  <theme-id>.json
```

`manifest.json` lists the available files. Each theme is stored separately and
can be edited without changing TypeScript code.

Keep personal or temporarily excluded packs in `.local-themes/`. Git ignores
this directory, and it is outside `public`, so its contents are not copied to
the production build.

Initial themes use `enabled: true`. Hide a temporary or unfinished theme from
the application by setting `enabled: false` in the manifest. The
`sensitive: true` field hides a theme by default and puts its visibility under
the user's “Чувствительные темы” setting.

## Manifest format

```json
{
  "schemaVersion": 1,
  "themes": [
    {
      "id": "places",
      "file": "places.json",
      "enabled": true,
      "sensitive": false
    }
  ]
}
```

## Theme format

```json
{
  "schemaVersion": 1,
  "id": "places",
  "name": "Места",
  "description": "Знакомые места и учреждения",
  "groups": [
    {
      "id": "transport-hubs",
      "name": "Транспортные узлы",
      "items": [
        "Аэропорт",
        "Железнодорожный вокзал",
        "Автовокзал"
      ]
    }
  ]
}
```

A group is a collection of sufficiently similar objects. Classic mode may select
any object from the entire theme. Alternative-word mode selects the real and
alternative objects from the same group.

This format:

- is human-readable without special tools;
- avoids duplicating pairs in both directions;
- supports more than two suitable alternatives;
- keeps content independent from application code.

## Quality rules

- identifiers are unique, use `kebab-case`, and are at most 64 characters;
- theme and group names are at most 80 characters, and descriptions at most 200;
- a theme contains 1 to 20 groups and no more than 300 objects in total;
- an object name is unique within the theme;
- a group contains 1 to 15 objects, each at most 80 characters;
- one-item groups work in classic mode and are skipped in alternative-word mode,
  where a pair is required;
- objects in one group should be comparable in scale and category;
- avoid near-identical synonyms and obviously unrelated pairs;
- technical fields and the schema version are validated during loading.

When selecting a new round, the application first excludes recently played
objects. Once no fresh objects remain, the repeat history is reset temporarily,
so even a small custom pack cannot block the game.

The runtime validator in
`src/games/spy/domain/theme/validateTheme.ts` is the authoritative source of
rules. JSON Schemas for editors live in `schemas/games/spy/`, and CI checks
their numeric limits against the runtime values. One invalid file must not break
the whole catalog: the application excludes that theme and displays a readable
message.

Run `npm run validate:themes` before committing. The complete contribution
workflow is documented in the [theme contribution guide](./adding-a-theme.md).
