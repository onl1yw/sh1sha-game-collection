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

A screen title with optional actions on the left and right. It always composes
the shared `AppBar`, so feature screens cannot accidentally lose sticky chrome
or its backdrop treatment. Use `onBack` for ordinary back navigation,
`leadingAction` for a compound action that needs confirmation, and
`trailingAction` for settings or other tools.

## AppBar

A sticky region for a screen's complete top block. `ScreenHeader`
uses it automatically; use `AppBar` directly only for a custom semantic
`header`, such as the game collection brand block. The bar body is an opaque
fill; a separate masked 20 px backdrop blur exists only on its 24 px content
edge. Its fill begins at the exact bar color before fading into the scrolling
area, avoiding a visible opacity seam. The sticky wrapper itself stays
transparent so it does not create or obscure the blur layer's backdrop root.
Unsupported, reduced-transparency, and forced-color environments simply omit
the decorative edge.

## ActionBar

The matching sticky bottom region for primary screen actions. `AppShell`
creates it automatically from the `actions` property, so screens provide only
their buttons and never duplicate safe-area, blur, or positioning styles.

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
trailing element. The default `row` layout is used for compact lists such as
Spy themes. Use `layout="tile"` for primary catalog entries: it creates a
square card with a larger icon while retaining the same interaction states.
Set icon color with `iconTone`: `accent` by default or the semantic red
`danger`.

## Switch

A compact two-state switch implemented as a button with `role="switch"` and
`aria-checked`. Place visible copy beside it in the parent screen, and supply
its accessible name through `label`. Its visual track remains compact while the
button keeps the minimum shared hit-target size.

## NumberStepper

A labeled integer control with decrease and increase buttons, a live value,
and optional hint copy. Pass explicit `min` and `max` bounds; the component
disables the corresponding action at either limit and never reports a value
outside those bounds.

## RangeField

A labeled native range input with a visible value. Use it for bounded numeric
preferences such as volume. Supply explicit `min`, `max`, and `step` values;
the component reports numeric values and exposes the formatted `valueText` to
assistive technology.

## SettingsButton

The shared settings action. It provides the Lucide settings icon, quiet button
styling, and a full touch target. Header placements use the icon-only form;
toolbars may set `showLabel` to display the visible “Настройки” label.

## ChoiceGroup

An accessible single-choice fieldset with native radio inputs, visible selected
state, titles, and optional descriptions. Pass stable string values and use it
when two or more mutually exclusive settings need more explanation than a
switch can provide. Spy mode and Mafia's Lover mode share this component.

## SectionLabel

The standard small section heading. Use it only when a section genuinely needs
a name; obvious labels such as “Games” above a single catalog are unnecessary.

## ConfirmAction

A two-step destructive action with confirmation and focus restoration. Use it
for destructive flows that need local confirmation. Use `GameExitAction` for
standard game and role-deal exits.

## GameExitAction

The shared confirmed exit control for active games and private role dealing.
Use `stage="deal"` while roles are still being passed between players; use the
default game copy once play has started. Do not recreate its icon, dialog, or
confirmation copy inside a game.

## Screen chrome contract

- The collection uses one custom `AppBar` with GitHub on the left and Settings
  on the right.
- Navigation and setup screens use `ScreenHeader`: Back on the left, Settings
  on the right, and the primary action through `AppShell.actions`.
- User-paced play screens use the same header, a confirmed exit where leaving
  would discard progress, Settings, and an `ActionBar` primary action.
- Mafia's user-paced Dawn and Elimination reveal screens follow that same
  contract: `GameExitAction` on the left and Settings on the right.
- Result screens keep Settings in the header and replay/exit actions below.
- Loading, recovery, error, and automatic countdown screens intentionally omit
  Settings. Never open an overlay from a transient screen whose timer would
  continue advancing in the hidden game.

## Adding interface elements

Check `src/shared/ui` before creating a new CSS control. If an existing
contract almost fits, extend that contract and its tests. A new feature
component is justified by its own behavior or composition, not by a different
color on the same button.
