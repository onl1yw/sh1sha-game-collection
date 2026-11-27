# Curated word pack expansion

Six separately selectable Russian packs are registered in Alias, Hat, and Spy.
Each game owns its JSON files and manifest entries. Catalogs load locally from
the application; there is no online dictionary dependency.

| ID | Player-facing name | Alias | Hat | Spy |
| --- | --- | ---: | ---: | ---: |
| `everyday` | На каждый день | 250 | 250 | 160 |
| `people-activities` | Люди и занятия | 200 | 200 | 160 |
| `animals-nature` | Животные и природа | 200 | 200 | 200 |
| `food-kitchen` | Еда и кухня | 200 | 200 | 200 |
| `explain-harder` | Объясни посложнее | 250 | 250 | 100 |
| `famous-characters` | Знаменитости и персонажи | 150 | 150 | 150 |
| Total added | | 1,250 | 1,250 | 970 |

## Editorial method

- Select words by topic and intended difficulty; fill topic gaps with original
  editorial additions. Preserve familiar Russian spellings, including `ё`.
- Check for duplicates against all existing packs and the other new packs,
  ignoring case, surrounding whitespace, and the `е`/`ё` spelling difference.
  Disambiguate genuinely different meanings, such as an animal and a fictional
  character, with a short qualifier.
- Keep the everyday pack concrete. The harder pack intentionally includes
  abstract concepts, less familiar objects, and specialist vocabulary.
- Use recognizable public names and character names for the celebrity pack.
  Its selection and organization were assembled specifically for this project.
  The pack contains no biographies, quotations, character descriptions, artwork,
  or endorsement claims.
- Review Hat entries for the three-stage loop. The harder pack deliberately
  makes gestures more demanding; difficulty labels are editorial judgments.
- For Spy, select comparable alternatives within named groups. Everyday and
  activity groups are shorter; the harder pack uses a smaller selection and
  dedicated optical-device and musical-accessory groups. Every group supports
  alternative-word mode.

All six packs are enabled and have no sensitive-content flag. Hat is visible in
the main catalog by default. The original word packs and their
enablement/sensitivity settings are preserved.

## Sources and rights

The vocabulary reference is the MIT-licensed
[TheTrueHat repository](https://github.com/m20-sch57/thetruehat), fixed at commit
`d1d13bf9334eb9dab4da8231d385fa2cc53bd602` (reviewed November 27, 2026):

- [`words/easy.json`](https://github.com/m20-sch57/thetruehat/blob/d1d13bf9334eb9dab4da8231d385fa2cc53bd602/words/easy.json)
- [`words/med.json`](https://github.com/m20-sch57/thetruehat/blob/d1d13bf9334eb9dab4da8231d385fa2cc53bd602/words/med.json)
- [`words/hard.json`](https://github.com/m20-sch57/thetruehat/blob/d1d13bf9334eb9dab4da8231d385fa2cc53bd602/words/hard.json)
- [`LICENSE`](https://github.com/m20-sch57/thetruehat/blob/d1d13bf9334eb9dab4da8231d385fa2cc53bd602/LICENSE)

The first five packs combine original editorial selection and additions with
vocabulary cross-checked against this reference. The celebrity selection is
original. The topics, ordering, descriptions, and Spy groupings are original
contributions under the repository's PolyForm Noncommercial terms. The source
MIT notice is preserved in `THIRD_PARTY_NOTICES.md` and shipped in the build.

The source README acknowledges cooperation with SIS.Hat. Its repository-wide
MIT license is the published permission relied on here; the word files carry
no separate license notice. This records the available provenance, rather than
claiming independent verification of every upstream contributor's rights.

No commercial game deck was imported. The Roman-/dicts compilations and the
Hugging Face gameplay dataset were research leads only. These packs do not
claim difficulty ratings calibrated from real gameplay statistics.

## Maintenance

Edit each game's owned catalog when changing its vocabulary. A change in one
game need not be propagated if it would harm another game's rules. Register
new packs in that game's manifest and preserve existing IDs for saved choices.
Source notes belong in documentation and legal notices; theme schemas reject
unknown metadata fields.

Run `npm run validate:themes` for catalog validation, then `npm run check`.
Focused tests also protect the six visible entries, word counts, normalized
uniqueness, clean Unicode, and playability of every new Spy group in both modes.
