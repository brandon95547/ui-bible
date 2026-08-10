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

## Deploying

Production is **static**: nginx serves `/var/www/ui-bible/dist` at
[ui.skylanex.com](https://ui.skylanex.com). There is no server process — `npm run dev`
never runs on the box — so a pull on its own changes nothing a visitor can see, because
`dist/` is gitignored and has to be rebuilt on the host.

```bash
ssh root@phansora.com
cd /var/www/ui-bible && git pull
systemctl restart ui-bible        # rebuild + swap dist/ into place
journalctl -u ui-bible -n 40      # what the build said
```

`ui-bible.service` is a oneshot unit pointing at `deploy/rebuild.sh`. The build goes to
`dist.new/` and is swapped in with a single `mv`, so the document root is never
half-written and a failed build leaves the live site untouched. The previous build stays
in `dist.old/` until the next run — rollback is `mv dist dist.bad && mv dist.old dist`.

`systemctl status ui-bible` reads `active (exited)` after a good build and `failed` after
a broken one, which makes it an honest answer to "is the deployed site current?".

Installing the unit (once, or after it changes — it is symlinked, so a pull updates it):

```bash
ln -sfn /var/www/ui-bible/deploy/ui-bible.service /etc/systemd/system/ui-bible.service
systemctl daemon-reload
```

nginx only needs `systemctl reload nginx` when `deploy/ui.skylanex.com.conf` itself
changes.

## What is in here

Five sections. Only **Components** is subdivided, and only one level deep.

| Section         | Contents                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Foundations** | Tokens, colour, typography, spacing, grid, radius, elevation, icons, motion, animation, breakpoints, accessibility, dark theme, light theme    |
| **Components**  | 65 components in seven groups — see below                                                                                                     |
| **Color**       | Palettes we did not draw — Flat UI Colors 2's fourteen — plus the page on converting one into something shippable                              |
| **Patterns**    | Dashboards, desktop, mobile, and the empty / error / loading states                                                                            |
| **Principles**  | The UX laws every rule in here derives from                                                                                                    |

**Foundations owns our colour; Color owns everyone else's.** The ramps, the semantic
roles and the contrast contract are a foundation and stay there. A borrowed palette has
no tokens, no theming and no authority — it is a reference you are being shown how to
convert. The argument for *how* you convert one lives once, on **Using a Palette**,
instead of fourteen times.

Each palette page then *performs* that conversion: twenty colours in, a working dark
theme out, in seven numbered sections — text ramp, surfaces, semantic roles, real
components, chart colours, alerts, elevation — plus the CSS to paste. Nothing on those
pages is transcribed. `palette-system.ts` derives every value from the hex and records
which of two things it is: **taken** (a literal palette colour, cited by its position in
the 5×4 grid and its name) or **derived** (computed, with the arithmetic stated). A
transcription error cannot survive contact with the audit table, and a derivation that
misses its target renders its own ratio in red.

The rules are deliberately dull, because their job is to make fourteen palettes
comparable rather than to out-design the people who drew them:

- **Text** is *solved*, not mixed. Bisection finds the ink that hits 8:1 against the
  page, so "secondary" means the same thing on all fourteen — a fixed percentage step
  gives a different ramp on every palette and a failing one on the darkest.
- **Semantic roles** take the nearest hue to each target, then the *brightest* of the
  near-ties. That second clause is the rule, not a tie-break: palettes are drawn in
  light/dark pairs (Emerald and Nephritis differ by 0.12° of hue), and sorting by hue
  alone lets floating-point noise orphan the pair the designer drew for exactly this.
- **Brightness always means relative luminance**, never HSL lightness. The two disagree
  where it matters: Sun Flower and Orange are 50.2% and 51.2% lightness — HSL calls the
  orange brighter — while their luminances are 0.58 and 0.41.
- **Elevation is never derived.** A shadow is the absence of light, so it is black at
  low alpha on every palette; tinting it with the brand hue is how a dark theme starts
  looking bruised.

Run against Flat UI v1 the derivation reproduces the hand-made poster it was modelled on
exactly — all six roles, both members of every pair. That is the check that the rules
encode taste rather than merely being consistent.

The section is flat while there is one source. A second (Material, IBM, Tailwind) turns
it into `groups`, one per source — the shape Components already uses.

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

Every page is the same nine sections in the same order:

1. Live preview — real interactive controls plus a full interaction-state matrix
2. Anatomy — every part labelled and measured, with the reason for each number
3. Design tokens used — read live from the running stylesheet
4. Recommended sizes — height, padding, radius, icon, gaps, touch target
5. Do — with the reason why
6. Don't — with the reason why
7. Accessibility — contrast, keyboard, ARIA, focus, screen readers, touch
8. Code — usage, framework-free HTML, CSS, and the component API
9. Notes — tips, performance, common mistakes, real-world recommendations

This is not decoration. Once a reader learns where "don't" lives, they know it for every
page, and looking something up stops costing attention.

The running component comes first: a page opens on the thing itself, not on prose about
it. `DocSpec.overview` still exists and every written page still carries its copy, but it
is no longer rendered — reinstating it is one block in `DocPage.tsx`.

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
