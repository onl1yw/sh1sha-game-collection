# UI guidelines

## Character

The interface is clean and utilitarian, optimized for a phone passed from one
person to another. Decoration must not compete with the current player's name or
the secret card.

## Palette

- main background: graphite `#17191C`;
- surface: `#22252A`;
- primary text: warm white `#F4F3EF`;
- secondary text: `#A9ADB5`;
- round and ordinary-object accent: signal yellow `#F2C94C`;
- explicit spy role and dangerous actions: calm red `#E06B65`.

Check every color pair against WCAG AA before implementation. Light mode uses
the same semantic tokens; components do not set colors directly and switch
through the `data-color-theme` attribute on the root element.

## Shape and layout

- one column;
- large hit targets of at least 44 pixels;
- moderate corner radii of 12–16 pixels;
- surfaces are separated primarily by background color; borders are reserved
  for controls, focus, and semantic states;
- no gradients;
- no background illustrations or complex vector graphics;
- use Lucide icons only when they make an action easier to recognize;
- no decorative animation; the functional role-card flip respects
  `prefers-reduced-motion`;
- hover states do not replace focus and pressed states.

## Secret card

- the role is absent from the screen until an explicit action reveals it;
- the system Back action must not reveal the previous player's role;
- after hiding, the role is removed from the visible area;
- the primary action sits within comfortable thumb reach;
- an explicit spy role is red, while an ordinary object is yellow;
- role text must be readable without scrolling on a typical mobile screen.

## CSS

`tokens.css`, `reset.css`, and `global.css` contain shared rules only.
Screen and component styles are isolated through CSS Modules and live beside
their corresponding `.tsx` files.

Reusable controls and their boundaries are documented in
`docs/ui-components.md`. Feature CSS owns layout; it does not create
alternative versions of buttons, cards, or switches.
