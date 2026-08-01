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

Four sections. Only **Components** is subdivided, and only one level deep.

| Section         | Contents                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Foundations** | Tokens, colour, typography, spacing, grid, radius, elevation, icons, motion, animation, breakpoints, accessibility, dark theme, light theme    |
| **Components**  | 65 components in seven groups — see below                                                                                                     |
| **Patterns**    | Dashboards, desktop, mobile, and the empty / error / loading states                                                                            |
| **Principles**  | The UX laws every rule in here derives from                                                                                                    |

| Component group  | Count | Contents                                                                                                                     |
| ---------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Navigation**   | 9     | App Bar, Sidebar, Bottom Navigation, Tabs, Breadcrumbs, Pagination, Menu, Mega Menu, Tree View                                 |
| **Actions**      | 6     | Button, Button Group, Split Button, Toolbar, Code Snippet, Command Palette                                                     |
| **Inputs**       | 22    | Text Field, Textarea, Number, Password, Search, Phone, JSON, Select, Combobox, Multi-select, Transfer List, Checkbox, Radio Button, Switch, Slider, Colour, Date, Time, File Upload, Pin, Rating, Form |
| **Feedback**     | 7     | Dialog, Toast, Banner, Tooltip, Popover, Progress Indicator, Skeleton                                                          |
| **Surfaces**     | 7     | Card, Accordion, Drawer, Backdrop, Divider, Carousel, Jumbotron                                                                |
| **Data Display** | 11    | Avatar, Badge, Chip, List, Data Table, Timeline, Gallery, Chart, QR Code, AI Label, KBD                                        |
| **Media**        | 3     | Image, Video, Link                                                                                                            |

## The one-purpose rule

Every component does exactly one job that no other component does, under exactly
one name. The industry ships four names for the same box — modal, dialog, popup,
lightbox — and a developer choosing between them is doing archaeology instead of
work.

So each page carries an `aliases` list: every other name the industry uses for
that component. Aliases are searchable and are printed under the page title, so
searching "snackbar" finds Toast **and tells you we call it Toast**. The
vocabulary converges instead of forking.

Two entries collapse into one when they differ only by:

| Difference    | Example                                                    |
| ------------- | ---------------------------------------------------------- |
| **placement** | a bottom app bar is an App Bar; a bottom sheet is a Drawer  |
| **trigger**   | a hover card is a Popover raised on hover                   |
| **size**      | a navigation rail is a Sidebar at its collapsed width       |
| **vendor**    | a snackbar is a Toast with a Material accent                |

They stay separate when the behaviour, the failure modes and the accessibility
contract genuinely differ. Not before.

An alias may only ever be claimed by one component, and may never be another
component's canonical name. `nav.ts` asserts both in development and logs a
loud console error if either is violated — the rule enforces itself rather than
relying on review.

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
    pages/          One file per page, exporting a DocSpec. Filename === page id.
    pages/_folded/  Pages whose component was merged into another. Outside the
                    glob, so they no longer publish; kept for their content
                    until it is folded into the surviving page.
    nav.ts          Single source of truth for the tree, search, aliases,
                    breadcrumbs and prev/next
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

1. Search the app for the name first. If it comes back as an alias of something that already
   exists, extend that page instead — that is the one-purpose rule doing its job.
2. Add an entry to the relevant group in `src/docs/nav.ts`, with `aliases` for every other
   name the industry uses for it.
3. Create `src/docs/pages/<id>.tsx` exporting `defineDoc({ … })`. The filename must equal
   the `id` in both `nav.ts` and `meta`.

That is the whole process. The registry discovers the file; the sidebar, search, command
palette, breadcrumbs and prev/next links all derive from `nav.ts`. An entry with no file
renders as “soon” rather than a 404 — the nav entry is the commitment, the file is the
delivery.

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
