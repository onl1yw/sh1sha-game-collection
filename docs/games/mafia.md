# Mafia

Mafia is a social deduction game for 5–12 active players. The phone deals
secret roles, resolves actions, records public eliminations, and determines the
winning team. It can guide the night by itself, or one additional participant
can be selected as Host by the same private role lottery.

Player-facing copy is intentionally Russian. Source code, tests, and this
documentation follow the repository's English contribution contract.

## Implemented scope

- editable player names and player count;
- editable ordinary Mafia count;
- optional Don, Commissioner, Doctor, Lover, and Maniac roles;
- optional neutral Host selected by lot;
- Civilians automatically fill every unused seat;
- click-to-flip secret role cards with reduced-motion support;
- pre-generated offline Russian narration with browser Speech Synthesis as a
  runtime fallback;
- shared sound enablement and volume through the collection settings;
- phone-guided night actions and private check results;
- simultaneous Mafia and Maniac attacks with Doctor and Lover interactions;
- public discussion and group-recorded elimination;
- optional role reveal when a player leaves the game;
- Town, Mafia-parity, Maniac, and mutual-elimination draw outcomes.

Individual vote collection and active-session recovery remain deferred until
their flows can be added without cluttering setup.

## Roles

| Role | Team | Night ability |
| --- | --- | --- |
| Civilian | Town | None |
| Mafia | Mafia | The living Mafia jointly chooses a target |
| Don | Mafia | Checks whether one non-Mafia player is the Commissioner |
| Commissioner | Town | Checks whether one player belongs to the Mafia team |
| Doctor | Town | Protects one living player from all attacks that night |
| Lover | Town | Protects and links to a player, or blocks their next vote |
| Maniac | Independent | Attacks one other living player |
| Host | Neutral | Reads the night prompts and never joins play or voting |

The role editor uses these hard constraints:

- at least one ordinary Mafia role;
- at least two Civilian roles;
- at most one of every optional role;
- Don requires an ordinary Mafia and Commissioner;
- Lover is available from seven active players;
- Maniac is available from nine active players;
- every configured role must fit the active player count;
- Host-by-lot needs one extra participant, leaving at least five active players.

Unconfigured seats are always Civilians. Changing the player count preserves
the current choices when possible and removes roles only when needed to keep a
valid minimum roster.

## Host modes

With **Host by lot** disabled, the phone is the moderator and spoken narration
is required during the closed-eye night. With it enabled, setup adds a single
neutral Host card to the shuffled deck. Enabling it at the five-player minimum
automatically adds a sixth name. Up to 13 participants are accepted for 12
active players plus the Host.

The selected Host receives the same private flip-card deal, then stays outside
the alive-player set. The Host cannot be targeted, vote, be eliminated, or
affect a team's win calculation, but remains visible in the final role list.
During the night the Host keeps the phone, reads its prompts, and hands it to
the called role. This mode may start while speech is muted or unsupported.

## Game loop

```text
setup
→ private role deal
→ night cover
→ ordered night actions
→ dawn
→ discussion
→ public elimination
→ win check
→ next night or results
```

Night order is deterministic:

1. Lover visit;
2. Mafia attack;
3. Don check;
4. Commissioner check;
5. Doctor protection;
6. Maniac attack.

Actions are collected in that order but resolved together after the final
step. Doctor protection cancels every attack against the protected player. If
Mafia and Maniac attack different unprotected players, both players leave the
game.

## Lover house rule

Casual Mafia does not have one canonical Lover role. This game deliberately
offers two explicit variants under one setup toggle:

- **Protect and link** — the selected player ignores direct Mafia and Maniac
  attacks that night. If the Lover dies from an unprevented direct night attack,
  the selected player also dies. That linked death bypasses protection on the
  selected player. Doctor protection on the Lover prevents her death and
  therefore prevents the linked death. Daytime elimination never triggers the
  link.
- **Block vote** — the selected player receives no kill protection and keeps
  every night ability. If alive at dawn, that player may discuss and may still
  be selected for elimination, but cannot cast a vote during that day. The vote
  screen shows a crossed-circle status indicator. The status expires before
  the next night, even if nobody was eliminated.

In both modes, the Lover chooses one other living player, cannot choose herself,
and cannot repeat the previous night's target. Her action is locked before the
other night actions and still resolves if she is killed later that night. If the
role is already dead while roles remain hidden, its ordinary dummy step keeps
the wake order private.

Every night starts with a three-second eyes-closed countdown. A living role then
waits for an explicit target confirmation and is never skipped by a timer.
Private checks stay visible until that player explicitly hides the result.
Every completed role is followed by the same visible `3 → 2 → 1 → 0` closing
countdown before the next role call.

When role reveal is disabled, an eliminated role still receives its role call,
a neutral 15-second dummy wait, and the same closing countdown. This preserves
the wake order without risking an endless wait for an actor who is no longer in
the game.

Town wins only after every Mafia and Maniac is eliminated while at least one
Town player remains alive. Mafia wins at parity only after the Maniac has been
eliminated; a living Maniac blocks the Mafia parity condition. Maniac wins as
the sole survivor. If no player or team survives a simultaneous resolution,
the game ends in a draw instead of awarding the win to Town.

## Sound

`Narrator` is an application port. `RecordedAudioNarrator` is the default
browser adapter and plays checked-in MP3 files from
`public/games/mafia/audio/`. It never calls a speech API at runtime. Stable cue
identifiers and their Russian source text live in `app/narrationCatalog.json`,
so arbitrary player names never require generated audio.

`SpeechSynthesisNarrator` remains a runtime fallback when the Audio API is
missing or recorded playback is rejected. Both adapters cancel overlapping
messages and contain broken browser media APIs. A fake narrator can still be
injected into `MafiaGameProvider` for tests.

Every spoken instruction also appears on screen. During a phone-hosted
closed-eye night, spoken role calls are the private coordination channel. That
mode cannot start while sound is muted or neither recorded playback nor the
fallback is available. A selected human Host can instead read the same prompts
without speech.

The settings action remains available throughout the game. Opening it pauses
narration without unmounting the active Mafia state. Sound enablement and a
0–100 volume value belong to the collection preferences, alongside color theme
and sensitive-content visibility. Returning to the game resumes the current
screen instead of restarting setup.

The current MP3 set was generated once on August 31, 2026, with ElevenLabs
Multilingual v2 and the shared `Marco - Deep, Rich and Reflective` voice under
an active paid/pay-as-you-go plan. Provider metadata is stored next to the
audio, and the applicable terms remain linked from `THIRD_PARTY_NOTICES.md`.
The API key lives only in ignored local `.env`; the one-off generation tooling
is intentionally kept under ignored `.local-audio-tools/`.

## Architecture

```text
src/games/mafia/
  domain/           pure roles, validation, dealing, night resolution, wins
  app/              reducer, phase transitions, commands, narration port
  features/         setup, secret deal, night, day, vote, and results screens
  infrastructure/   cryptographic randomness and audio playback
```

The domain has no React or browser dependencies. Lucide icons exist only in the
feature layer. `RoleRevealCard` is shared by private role dealing and public
elimination reveals, so both flows keep the same card geometry and flip
interaction. The game does not import Spy or any other concrete game.

## Testing

Focused tests cover:

- default and custom role composition;
- Host dealing, active-player exclusion, and neutral win accounting;
- setup validation and role constraints;
- deterministic dealing with injected randomness;
- hidden-role dummy night steps;
- Doctor, Mafia, Commissioner, Don, and Maniac resolution;
- both Lover modes, Doctor interaction, linked deaths, and target restrictions;
- the one-day blocked-vote state and its accessible voting indicator;
- every win condition;
- reducer transition order;
- non-skipping living-role actions and timed dummy-role recovery;
- the circular three-second handoff between night roles;
- secret-card and setup accessibility;
- shared volume application and speech adapter failures;
- narration availability and the guarded night-cover start;
- lazy module loading.

Run the complete repository gate before contributing:

```bash
npm run check
```

## Rules references

This implementation uses original interface copy and source code. Publisher
rulebooks assign very different mechanics to roles named Lover, Vixen, Beauty,
or Admirer, so the two modes above are documented house rules rather than a
claim of canonical Mafia behavior. The Hobby World references provide the
published protection, role-block, repeated-target, and linked-visit precedents;
the GaGa/1C reference demonstrates a different Mafia-aligned Lover mechanic.

- <https://maffederation.ru/rules/game>
- <https://images-cdn.fantasyflightgames.com/filer_public/83/7a/837a5b73-ea6d-4aaa-b723-cbc1a201ce21/va95_mafia_rules_eng_v5compressed.pdf>
- <https://hobbygames.ru/download/rules/mafia-vsja-semja-v-sbore-compact-rules.pdf>
- <https://hobbygames.ru/download/rules/Candy_Mafia_Rules.pdf>
- <https://www.1c-interes.ru/images/2024/05/Mafiyasmaskami_rules.pdf>
