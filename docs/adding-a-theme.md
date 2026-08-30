# Adding a Spy theme

A new theme is a data-only contribution and does not require changes to game
logic. The catalog is built exclusively from
`public/games/spy/themes/manifest.json`.

## 1. Create a JSON file

Add `public/games/spy/themes/<theme-id>.json`. Write the file name and every
`id` in Latin characters using `kebab-case`.

```json
{
  "schemaVersion": 1,
  "id": "city-transport",
  "name": "Городской транспорт",
  "description": "Знакомые способы передвижения по городу",
  "groups": [
    {
      "id": "public-transport",
      "name": "Общественный транспорт",
      "items": ["Автобус", "Трамвай", "Метро"]
    }
  ]
}
```

A group contains comparable objects. In alternative-word mode, the game selects
two objects from the same group, so groups with at least two objects are more
useful. A one-item group is valid, but works only in classic mode.

## 2. Follow the limits

- no more than 20 groups and 15 objects per group, for a maximum of 300 objects;
- an `id` is at most 64 characters;
- theme and group names are at most 80 characters;
- a description is at most 200 characters;
- an object is at most 80 characters;
- empty names, IDs, objects, and unknown fields are prohibited;
- group IDs and object names must not be duplicated;
- object duplicates are checked case-insensitively after trimming whitespace.

Do not copy word lists from commercial games or other sources without
permission. Add only content that you own or whose license permits distribution
under this project's terms.

## 3. Register the file

Add one entry to `manifest.json`:

```json
{
  "id": "city-transport",
  "file": "city-transport.json",
  "enabled": true,
  "sensitive": false
}
```

- `enabled: true` publishes the theme in the application;
- `sensitive: true` hides sensitive content by default;
- the manifest `id` must match the `id` inside the file.

Do not add drafts to `public`. You may keep unfinished local packs in the
ignored `.local-themes/` directory.

A new theme receives a neutral icon automatically. A custom icon is optional and
may be proposed as a separate change to the icon registry.

## 4. Validate the contribution

```bash
npm run validate:themes
npm run check
```

The first command reads the manifest and passes every listed file through the
same runtime validator used by the game. The second runs every project check.

In the pull request, briefly describe the source of the collection, its grouping
principle, and the reason for `sensitive: true`, if that flag is used.
