# UI components

Shared interface elements live in `src/shared/ui`. Feature screens compose
these elements and define layout only. They should not redraw custom buttons,
cards, or switches when an existing contract already fits the need.

## Tokens

Colors, spacing, radii, font sizes, and the minimum hit-target size are declared
in `src/app/styles/tokens.css`. Components use CSS custom properties only.
Light and dark modes change the values of the same tokens.

## AppShell

The shell for one screen. It constrains width, respects the safe area, and can
pin the primary action to the bottom when needed.

## ScreenHeader

A screen title with optional actions on the left and right. Use `onBack` for
ordinary back navigation. Use `leadingAction` for a compound action that needs
confirmation and `trailingAction` for settings or other tools.

## Button

The standard button has four variants:

- `primary` — the screen's main action;
- `secondary` — a neutral choice;
- `danger` — a destructive or dangerous action;
- `quiet` — navigation and header actions.

Express the selected state of a `secondary` button through `aria-pressed`.
Enable the full-width layout with the `fullWidth` property.

## Card

A non-interactive surface that groups fields, text, or preferences. `Card`
does not receive a click handler; use `InteractiveCard` for selection.

## InteractiveCard

A clickable catalog card with a Lucide icon, title, optional description, and
trailing element. It is used for both the game list and Spy themes, keeping
their geometry and typography consistent. Set icon color with `iconTone`:
`accent` by default or the semantic red `danger`.

## Switch

A compact two-state switch implemented as a button with `role="switch"` and
`aria-checked`. Place visible copy beside it in the parent screen, and supply
its accessible name through `label`.

## SectionLabel

The standard small section heading. Use it only when a section genuinely needs
a name; obvious labels such as “Games” above a single catalog are unnecessary.

## ConfirmAction

A two-step destructive action with confirmation and focus restoration. Use it
for resetting history and aborting role assignment.

## Adding interface elements

Check `src/shared/ui` before creating a new CSS control. If an existing
contract almost fits, extend that contract and its tests. A new feature
component is justified by its own behavior or composition, not by a different
color on the same button.
