# Hat

Hat is a local pass-and-play team game that runs one fixed set of words through
three increasingly constrained stages. Its player-facing interface is Russian.

## Setup

- One to eight editable teams; one team is a valid cooperative game.
- Multiple Hat-local theme packs may be mixed.
- The fixed word-pool size uses 10, 30, 50, or a custom value from 5 to 100.
- A game cannot start when the selected themes contain fewer unique words than
  the requested pool size.
- Turn duration uses 15, 30, 60, or a custom value from 10 to 180 seconds.

The selected words are shuffled once and remain the master pool for the entire
game. A fresh permutation of those exact words starts every stage.

## Stages and turns

The game has exactly three stages and an unlimited number of timed turns inside
each stage:

1. Describe with words without saying the answer or a word with the same root.
2. Show the answer with gestures, without speech, sounds, or written letters.
3. Give exactly one spoken word as the clue.

Teams alternate turns until the stage pool is empty. A confirmed answer awards
one point and leaves the current pool. A skipped word is reinserted at a random
later position and may be shown to another team. The third completed stage ends
the game; there is no configurable score or turn limit.

## Review and remaining time

Every turn ends with a review of claimed answers. Disabled claims return to the
pool and award no point. If the final claim is disabled while time remains, the
same team resumes the same turn for the saved remainder.

When a reviewed pool is empty before the timer expires, the team chooses:

- continue the next stage immediately with only the remaining time; or
- save the remainder as a one-time credit added to that team's next normal
  turn while the next team starts the new stage.

The choice is skipped at zero remaining time and after the final stage.

## Results and state

Multiple teams receive a score ranking and ties are supported. A one-team game
emphasizes the number of turns and active play time instead of declaring a
winner. A completed game distributes exactly `wordCount * 3` points.

Sessions intentionally remain in memory for this first release. Opening global
settings or an exit confirmation pauses an active timer; a full reload starts a
new setup.

## Content and testing

Hat keeps its own catalog under `public/games/hat/themes/`, alongside its own
schemas, loader, and validation. The initial catalog was adapted from the
checked-in Alias catalog under the same PolyForm Noncommercial terms and is now
maintained independently. No commercial word deck was copied. Enabled words
are globally unique after trimming and Russian case normalization.

Automated coverage includes setup validation, deterministic pool selection,
skip reinsertion, reducer transitions, review corrections, time credits,
single-team play, catalog integrity, timer pausing, swipe interactions, and the
complete three-stage score invariant.
