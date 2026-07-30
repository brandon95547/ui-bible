# UI Bible

The permanent interface standard. Not a component gallery and not documentation — the
reasoning, the measurements and the working code behind every surface we ship.

## Running it

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # typecheck + production build
npm run preview
```

## What is in here

| Area            | Contents                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Foundations** | Tokens, colour, typography, spacing, grid, radius, elevation, icons, motion, animation, breakpoints, accessibility, dark theme, light theme |
| **Actions**     | Buttons — eight variants, four sizes, split, FAB, icon                                                                                      |
| **Inputs**      | Text inputs, dropdowns, checkboxes, radios, switches, form patterns                                                                         |
| **Data**        | Cards, tables, badges, chips                                                                                                                |
| **Feedback**    | Alerts, toasts, snackbars, progress, skeletons, empty/error/loading states                                                                  |
| **Navigation**  | Top bar, sidebar, tabs, breadcrumbs, bottom nav, drawer, mega menu                                                                          |
| **Overlays**    | Dialogs, bottom sheets                                                                                                                      |
| **Patterns**    | Dashboards, desktop patterns, mobile patterns                                                                                               |
| **Principles**  | The UX laws every rule in here derives from                                                                                                 |

## The page contract

Every page is the same ten sections in the same order:

1. Overview — purpose, when to use, when **not** to use, UX reasoning
2. Live preview — real interactive controls plus a full interaction-state matrix
3. Anatomy — every part labelled and measured, with the reason for each number
4. Design tokens used — read live from the running stylesheet
5. Recommended sizes — height, padding, radius, icon, gaps, touch target
6. Do — with the reason why
7. Don't — with the reason why
8. Accessibility — contrast, keyboard, ARIA, focus, screen readers, touch
9. Code — usage, framework-free HTML, CSS, and the component API
10. Notes — tips, performance, common mistakes, real-world recommendations

This is not decoration. Once a reader learns where "when not to use" lives, they know it
for every page, and looking something up stops costing attention.

## Architecture

```
src/
  styles/
    tokens.css      Three-tier token layer — primitives, semantics, Tailwind binding
    globals.css     Base layer, focus policy, composed utilities
  ui/               The real design system. Used by the Bible's own chrome.
  docs/
    framework/      The page renderer: DocPage, PreviewStage, blocks, kit
    pages/          One file per page, exporting a DocSpec
    nav.ts          Single source of truth for sidebar, search and prev/next
    registry.ts     File-system discovery via import.meta.glob
  app/              Shell, sidebar, command palette, Inspector Mode
```

### Tokens

Three tiers, one direction of reference:

- `--p-*` **primitive** — raw values, no meaning, never referenced by a component
- `--ds-*` **semantic** — meaning not appearance, the only tier components read
- `--c-*` **component** — private per-component overrides, must reference tier 2

Themes redefine tier 2 only. `@theme inline` keeps the `var()` reference in the generated
Tailwind utility, which is what allows a `[data-theme]` island to re-theme any subtree at
runtime — including the light-mode previews inside the dark app.

### Adding a page

1. Add an entry to the relevant group in `src/docs/nav.ts`.
2. Create `src/docs/pages/<id>.tsx` exporting `defineDoc({ … })`.

That is the whole process. The registry discovers the file; the sidebar, search, command
palette and prev/next links all derive from `nav.ts`.

## Inspector Mode

Press <kbd>⌘I</kbd>. Hover any element to get its box model, typography, composited
contrast ratio, the semantic tokens behind it, and a sentence explaining why that value was
chosen. Click to freeze the readout, <kbd>Esc</kbd> to exit.

Primitives tag themselves through `inspect()` in `src/lib/inspect.ts`. Geometry comes from
the DOM; intent has to come from the component.

## Keyboard

| Key            | Action                        |
| -------------- | ----------------------------- |
| <kbd>⌘K</kbd>  | Command palette               |
| <kbd>/</kbd>   | Command palette               |
| <kbd>⌘B</kbd>  | Toggle the sidebar            |
| <kbd>⌘I</kbd>  | Toggle Inspector Mode         |
| <kbd>↑ ↓</kbd> | Move through the sidebar tree |
| <kbd>Esc</kbd> | Dismiss the topmost layer     |
