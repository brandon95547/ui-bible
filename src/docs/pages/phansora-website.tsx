import * as React from 'react'
import {
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronsUpDown,
  CircleCheck,
  CircleX,
  Check,
  Contrast,
  FileText,
  Files,
  Layers,
  Pointer,
  Quote,
  Search,
  SquareDashed,
  TriangleAlert,
  Type,
  User,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/ui/Display'
import { Field, TextInput } from '@/ui/Input'
import {
  BarScale,
  BoardCard,
  BoardColumn,
  Group,
  Groups,
  Ground,
  LevelTable,
  LevelTiles,
  Note,
  RadiusScale,
  SheetScope,
  SpacingScale,
  StateMatrix,
  Stage,
  Swatches,
  Tiles,
  TypeSpecimen,
  contrast,
} from '../framework/DesignSheet'
import { defineDoc } from '../framework/types'
import {
  BREAKPOINTS,
  HOME_FILL,
  PH,
  SPACING,
  TYPE_FLOOR,
  WEBSITE as W,
  homeScope,
  interiorScope,
} from '../data/phansora-sheet'
import { ASSETS, AlertDialog, PhButton, PhansoraSheet, stateCells } from './_phansora/parts'

/* ===========================================================================
   DESIGN SHEETS · PHANSORA WEBSITE, SECOND EDITION

   The public site on one board, card by card as Phansora's own design sheet
   lays it out: colors, type and buttons; forms, spacing and navigation;
   elevation and its three grounds, surfaces, feedback and accessibility; then
   the backdrops, the alerts and the blocks its pages are built from.

   Every value is the site's (data/phansora-sheet.ts). The site is mostly
   bespoke markup over a few shared components, so most of it is drawn here
   from the same tokens, as the site draws it; where the Bible has the
   component — a field, a badge — it is the Bible's, in the site's scope.
   ======================================================================== */

const P = PH.website
const B = W.buttons

/* -- Small parts ------------------------------------------------------------ */

/** The product name beside its mark, as the header and footer set it. */
function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-[0.1em] text-2xl font-semibold leading-none tracking-tight text-white', className)}>
      <img src={`${ASSETS}/mark.svg`} alt="" width={40} height={40} className="h-[1.6667em] w-auto shrink-0 -translate-y-[0.205em]" />
      Phansora
    </span>
  )
}

/** The donate page's suggested amounts: radios, drawn as chips. */
function AmountChips() {
  const [amount, setAmount] = React.useState('25')
  return (
    <div role="radiogroup" aria-label="Amount example" className="grid grid-cols-2 gap-3">
      {['25', 'Other'].map((a) => {
        const on = amount === a
        return (
          <label
            key={a}
            className="relative flex h-14 cursor-pointer items-center justify-center rounded-xl border text-label-lg text-white transition has-[:focus-visible]:ring-2"
            style={{
              borderColor: on ? P.chipCheckedEdge : P.chipEdge,
              backgroundColor: on ? B.primary.rest.bg : W.levels[1].value,
              boxShadow: on ? '0 10px 15px -3px rgb(75 78 240 / 0.5)' : undefined,
            }}
          >
            <input type="radio" name="ph-amount" value={a} checked={on} onChange={() => setAmount(a)} className="sr-only" />
            {a === 'Other' ? a : `$${a}`}
          </label>
        )
      })}
    </div>
  )
}

/** The home page's product demo tabs: the current one glows in the brand. */
function DemoTabs() {
  const [tab, setTab] = React.useState('narrava')
  return (
    <div role="tablist" aria-label="Demo tabs example" className="grid grid-cols-2 gap-1.5 rounded-[18px] border border-[rgb(255_255_255/0.08)] bg-[rgb(255_255_255/0.04)] p-1.5">
      {[
        { id: 'narrava', label: 'Narrava' },
        { id: 'atlas', label: 'Atlas' },
      ].map((t) => {
        const on = tab === t.id
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => setTab(t.id)}
            className={cn('rounded-full px-[1.15rem] py-[0.6rem] text-label-sm transition-colors', on ? 'text-white' : 'text-[#aeb6d4] hover:text-white')}
            style={
              on
                ? {
                    backgroundImage: `linear-gradient(135deg, #8b7bf7, ${P.brand})`,
                    boxShadow: '0 8px 22px -8px rgb(139 123 247 / 0.8), inset 0 0 0 1px rgb(255 255 255 / 0.12)',
                  }
                : undefined
            }
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

const card = 'rounded-2xl border border-[var(--ds-border-interactive)] bg-[var(--ds-surface)]'
const homeCard = 'group relative flex flex-col overflow-hidden rounded-2xl border border-[rgb(255_255_255/0.1)] bg-[var(--ds-surface)] transition-colors hover:border-[rgb(255_255_255/0.2)]'

/** A post's comparison table, as its HTML is stored in the CMS: a row lifts when its box is checked. */
function CmsTable() {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({ Gemini: true })
  const rows = [
    { model: 'Claude', note: 'Fast', cost: '$$' },
    { model: 'Gemini', note: 'Fastest', cost: '$' },
  ]
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)]">
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="text-left text-[var(--ds-fg)]">
            <th className="w-10 px-3 py-3">
              <span className="sr-only">Highlight</span>
            </th>
            <th className="px-3 py-3 font-medium">
              <span className="inline-flex items-center gap-1">
                Model <ChevronsUpDown size={14} className="text-[var(--ds-fg-muted)]" aria-hidden />
              </span>
            </th>
            <th className="px-3 py-3 font-medium">Cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const on = !!checked[r.model]
            return (
              <tr
                key={r.model}
                className="border-t border-[var(--ds-border)] text-[var(--ds-fg-muted)] transition-colors"
                style={on ? { backgroundColor: W.levels[2].value } : undefined}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Highlight ${r.model}`}
                    checked={on}
                    onChange={() => setChecked((c) => ({ ...c, [r.model]: !c[r.model] }))}
                    className="h-4 w-4"
                    style={{ accentColor: P.brand }}
                  />
                </td>
                <td className="px-3 py-3">
                  <span className="block font-medium text-[var(--ds-fg)]">{r.model}</span>
                  <span className="block text-caption">{r.note}</span>
                </td>
                <td className={cn('px-3 py-3', on && 'text-[var(--ds-fg)]')}>{r.cost}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** One of the site's three grounds: its ladder as chips, then a card standing on it. */
function GroundDemo({
  name,
  vars,
  ladder,
  children,
}: {
  name: string
  vars?: Record<`--${string}`, string>
  ladder: string[]
  children: React.ReactNode
}) {
  return (
    <SheetScope vars={vars ?? {}}>
      <Ground className="h-full">
        <span className="text-label-xs text-[var(--ds-fg)]">{name}</span>
        <div className="grid grid-cols-4 gap-1.5">
          {ladder.map((c) => (
            <span key={c} className="block h-7 rounded-md border border-[var(--ds-border)]" style={{ backgroundColor: c }} />
          ))}
        </div>
        {children}
      </Ground>
    </SheetScope>
  )
}

/** A composed background, given room and a name. */
function Backdrop({ label, style, children }: { label: string; style: React.CSSProperties; children: React.ReactNode }) {
  return (
    <figure className="m-0 flex min-w-0 flex-col gap-1.5">
      <div className="relative flex min-h-[120px] flex-col justify-end gap-0.5 overflow-hidden rounded-xl border border-[var(--ds-border)] p-3.5" style={style}>
        {children}
      </div>
      <figcaption className="text-caption text-[var(--ds-fg-muted)]">{label}</figcaption>
    </figure>
  )
}

/* -- The board -------------------------------------------------------------- */

const ratio = (fg: string) => `${contrast(fg, W.contrast.on).toFixed(1)}:1`
const LADDER = W.levels.map((l) => l.value)

const WebsiteBoard = ({ onNavigate }: { onNavigate: (id: string) => void }) => (
  <PhansoraSheet sheet="website" onNavigate={onNavigate}>
    {/* 01 ─ Colors */}
    <BoardCard
      id="colors"
      n={1}
      title="Color System"
      lede="Brand blue for the action, gold for signing in, warm cream type on deep navy."
      span={5}
      wide
    >
      {W.colors.map((row) => (
        <Swatches key={row.label} row={row} />
      ))}
    </BoardCard>

    {/* 02 ─ Typography */}
    <BoardCard id="type" n={2} title="Typography" lede={`Inter, one scale shared with the dashboard. Nothing under ${TYPE_FLOOR}px.`} span={3}>
      <TypeSpecimen steps={W.type} />
    </BoardCard>

    {/* 03 ─ Buttons */}
    <BoardCard id="buttons" n={3} title="Buttons" lede="Suno's pill, in the site's fills: hover lays a 4% wash over any of them. Gold is for signing in." span={4}>
      <StateMatrix
        rows={Object.values(B).map((v) => ({
          label: v.label,
          // A button made for a colored band is shown on one, where a grey edge would vanish.
          cellStyle: v.band ? { backgroundImage: v.band, paddingBlock: 6 } : undefined,
          cells: stateCells((p) => (
            <PhButton v={v} {...p}>
              Button
            </PhButton>
          )),
        }))}
      />
      <Groups>
        <Group label="Sizes">
          <div className="flex flex-wrap items-center gap-2.5">
            <PhButton v={B.gold}>md · 36</PhButton>
            <PhButton v={B.primary} size="lg">
              lg · 44
            </PhButton>
          </div>
        </Group>
        <Group label="With icons">
          <div className="flex flex-wrap items-center gap-2.5">
            <PhButton v={B.light} size="lg" endIcon={<ArrowRight />}>
              Start free
            </PhButton>
            <PhButton v={B.primary} startIcon={<FileText />}>
              Sample PDF
            </PhButton>
          </div>
        </Group>
      </Groups>
      <Group label="Full width · sign in">
        <PhButton v={B.neutral} size="lg" fullWidth startIcon={<img src={`${ASSETS}/google-g.svg`} alt="" width={20} height={20} />}>
          Log in with Google
        </PhButton>
      </Group>
    </BoardCard>

    {/* 04 ─ Form controls */}
    <BoardCard id="forms" n={4} title="Form Controls" lede="Sign-in, contact, donate, comments and the blog search." span={5} wide>
      <Groups>
        <Field label="Text input" htmlFor="pw-email">
          <TextInput id="pw-email" type="email" size="lg" placeholder="Username or Email" />
        </Field>
        <Field label="With an icon" htmlFor="pw-name">
          <TextInput id="pw-name" size="lg" placeholder="Name on card" startIcon={<User />} />
        </Field>
        <Group label="Search input">
          <div className="flex items-stretch overflow-hidden rounded border border-[var(--ds-border-interactive)] focus-within:border-[#b3c0ff]">
            <input
              type="text"
              aria-label="Search the blog"
              defaultValue="AI"
              placeholder="Search…"
              className="h-10 w-full bg-[var(--ds-canvas)] px-3 text-body-sm text-[var(--ds-fg)] outline-none"
            />
            <button type="button" aria-label="Search" className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-white" style={{ backgroundColor: P.brand }}>
              <Search size={16} aria-hidden />
            </button>
          </div>
          <ul aria-label="Search results example" className="overflow-hidden rounded border border-[var(--ds-border-interactive)] bg-[var(--ds-surface)] text-caption">
            {['Which AI Platform Should I Use?', 'How AI Is Manipulating the World'].map((t) => (
              <li key={t}>
                <a href="#forms" className="block px-3 py-2 font-medium hover:bg-[rgb(255_255_255/0.05)]">
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </Group>
      </Groups>
      <Groups>
        <Group label="Radio chips">
          <AmountChips />
        </Group>
        <Field
          label="Validation / error"
          status="error"
          description="From $5 to $10,000, one time."
          message="Enter at least $5."
          htmlFor="pw-amount"
        >
          <TextInput id="pw-amount" size="lg" inputMode="decimal" defaultValue="2" prefix="$" status="error" />
        </Field>
        <Group label="Textarea">
          {/* A post's comment form, on the article ground. */}
          <SheetScope vars={interiorScope}>
            <Ground>
              <textarea
                rows={3}
                aria-label="Message"
                placeholder="Message"
                className="w-full rounded border border-[var(--ds-fg-secondary)] bg-transparent p-3 text-body-sm text-[var(--ds-fg)] outline-none placeholder:text-[var(--ds-fg-muted)]"
              />
              <PhButton v={B.gold} fullWidth>
                SUBMIT
              </PhButton>
            </Ground>
          </SheetScope>
        </Group>
      </Groups>
      <Group label="Contact · on the home page">
        {/* On the home page the fields are the surface, and the button is the one light fill. */}
        <SheetScope vars={homeScope}>
          <Ground>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Your Name', 'Your Email'].map((p) => (
                <input
                  key={p}
                  aria-label={p}
                  placeholder={p}
                  className="w-full rounded-lg border border-[rgb(255_255_255/0.1)] bg-[var(--ds-surface)] px-4 py-3 text-body-sm text-[var(--ds-fg)] outline-none placeholder:text-[#7f868c] focus:border-[rgb(255_255_255/0.4)]"
                />
              ))}
            </div>
            <PhButton v={HOME_FILL} size="lg" fullWidth>
              Send Message
            </PhButton>
          </Ground>
        </SheetScope>
      </Group>
    </BoardCard>

    {/* 05 ─ Layout & spacing */}
    <BoardCard id="layout" n={5} title="Layout & Spacing" lede="Tailwind's 4px step, the corners in use, and the page container." span={3}>
      <Group label="Spacing scale (px)">
        <SpacingScale steps={SPACING} accent={W.accent} />
      </Group>
      <Group label="Corner radius">
        <RadiusScale radii={W.radii} />
        <Note>Fields and small boxes 4–8 · cards 16 · bands 24 · chips and pills full.</Note>
      </Group>
      <Group label="Page container">
        <div className="grid h-[92px] grid-cols-[16px_minmax(0,1fr)_16px] gap-1.5 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-canvas)] p-2" aria-hidden>
          <span className="rounded" style={{ backgroundColor: `color-mix(in srgb, ${W.accent} 22%, transparent)` }} />
          <span
            className="grid place-items-center rounded-md border border-dashed text-caption text-[var(--ds-fg-secondary)]"
            style={{ borderColor: `color-mix(in srgb, ${W.accent} 70%, transparent)` }}
          >
            container
          </span>
          <span className="rounded" style={{ backgroundColor: `color-mix(in srgb, ${W.accent} 22%, transparent)` }} />
        </div>
        <Note>Full width, capped at each breakpoint, with 16 / 24 / 32px sides.</Note>
      </Group>
      <Group label="Breakpoints">
        <BarScale accent={W.accent} rows={BREAKPOINTS.map((b) => ({ name: b.name, value: b.px }))} />
        <Note>Tailwind's own. Below lg the header folds into the mobile menu.</Note>
      </Group>
    </BoardCard>

    {/* 06 ─ Navigation */}
    <BoardCard id="navigation" n={6} title="Navigation" lede="Light type on the navy band; a link turns gold under the pointer." span={4}>
      <Group label="Header">
        <div className="overflow-x-auto">
          <nav aria-label="Header example" className="flex min-w-[560px] items-center justify-between rounded-xl px-4 py-3 text-white" style={{ backgroundColor: P.header }}>
            <div className="flex items-center gap-8">
              <Wordmark />
              <ul className="flex gap-7 text-body">
                {['Products', 'Blog', 'Contact'].map((l) => (
                  <li key={l}>
                    <a href="#navigation" className="hover:text-[#e3bf6e]">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <PhButton v={B.gold}>Login</PhButton>
          </nav>
        </div>
      </Group>
      <Groups>
        <Group label="Mobile menu">
          {/* Below a desk's width the header's links move into this panel. */}
          <aside
            aria-label="Mobile menu example"
            className="relative overflow-hidden rounded-xl border-l text-white shadow-[0_25px_50px_-12px_rgb(0_0_0/0.6)]"
            style={{ borderColor: 'rgb(91 98 224 / 0.3)', backgroundImage: `linear-gradient(to bottom, ${P.header}, #050b1a, #050b1a)` }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                backgroundImage:
                  'linear-gradient(205deg, rgb(94 116 216 / 0.3) 0%, rgb(94 116 216 / 0) 58%), linear-gradient(25deg, rgb(227 191 110 / 0.14) 0%, rgb(227 191 110 / 0) 48%)',
              }}
            />
            <div className="relative flex flex-col p-4">
              <nav aria-label="Mobile links example" className="flex flex-col gap-1 text-body">
                {['Products', 'Blog', 'Contact'].map((l) => (
                  <a key={l} href="#navigation" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[#e2ddd1] transition-colors hover:bg-[rgb(255_255_255/0.05)] hover:text-white">
                    <span className="h-1.5 w-1.5 rounded-full opacity-60 transition group-hover:opacity-100" style={{ backgroundColor: P.brand }} />
                    {l}
                  </a>
                ))}
              </nav>
              <div className="mt-4 border-t border-[rgb(255_255_255/0.1)] pt-4">
                <PhButton v={B.gold} size="lg" fullWidth>
                  Login
                </PhButton>
              </div>
            </div>
          </aside>
        </Group>
        <Group label="Tabs">
          <DemoTabs />
          <p className="mt-2 text-label-sm text-[var(--ds-fg-secondary)]">Filter chips</p>
          <ul className="flex flex-wrap items-center gap-2">
            <li>
              <a
                href="#navigation"
                aria-current="true"
                className="inline-flex items-center rounded-full border px-3.5 py-1.5 text-label-sm"
                style={{ borderColor: P.brand, backgroundColor: 'rgb(91 98 224 / 0.15)', color: '#c2cbf0' }}
              >
                All
              </a>
            </li>
            <li>
              <a
                href="#navigation"
                className="inline-flex items-center rounded-full border border-[var(--ds-border-interactive)] px-3.5 py-1.5 text-label-sm text-[var(--ds-fg-secondary)] transition-colors hover:text-[var(--ds-fg)]"
              >
                Narrava Studio
              </a>
            </li>
          </ul>
        </Group>
      </Groups>
      <Group label="Categories">
        <ul className="divide-y divide-[var(--ds-border-interactive)] rounded border border-[var(--ds-border-interactive)] bg-[var(--ds-surface)] text-body-sm">
          <li className="flex items-center justify-between px-4 py-3">
            <a href="#navigation" className="font-medium hover:underline" style={{ color: P.link }}>
              All posts
            </a>
          </li>
          <li className="flex items-center justify-between px-4 py-3">
            <a href="#navigation" className="hover:underline">
              AI Tools &amp; Productivity
            </a>
            <span className="text-caption text-[var(--ds-fg-muted)]">4</span>
          </li>
        </ul>
      </Group>
    </BoardCard>

    {/* 07 ─ Surface elevation */}
    <BoardCard
      id="elevation"
      n={7}
      title="Surface Elevation"
      lede="Depth is lightness: whatever rests on a surface is one step lighter than it."
      span={5}
      wide
    >
      <LevelTiles levels={W.levels} />
      <Groups min={220}>
        <Group label="Elevation in practice">
          {/* The sign-in page: a field on a card on the page. */}
          <Ground>
            <span className="text-label-sm text-[var(--ds-fg)]">Base 0 — the page</span>
            <div className="rounded-2xl border border-[var(--ds-border)] p-4" style={{ backgroundColor: W.levels[1].value, boxShadow: W.shadows[0].value }}>
              <span className="text-label-sm text-[var(--ds-fg)]">Level 1 — the panel</span>
              <TextInput aria-label="Email" size="lg" placeholder="Field · level 2" className="mt-3" />
            </div>
          </Ground>
        </Group>
        <Group label="Elevation tokens">
          <LevelTable levels={W.levels} shadows={W.shadows} />
        </Group>
      </Groups>
      <Group label="Three grounds">
        {/* One class on <body> rebinds the ladder and the type, and every component follows. */}
        <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,156px),1fr))]">
          <GroundDemo name="Product pages · navy" ladder={LADDER}>
            <div className={cn(card, 'p-4')}>
              <p className="text-h4 text-[var(--ds-fg)]">Research Atlas</p>
              <p className="mt-1 text-body-sm text-[var(--ds-fg-secondary)]">Sign-in, donate, release notes.</p>
              <PhButton v={B.primary} className="mt-3">
                Start free
              </PhButton>
            </div>
          </GroundDemo>
          <GroundDemo name="Articles · black" vars={interiorScope} ladder={['#000000', '#101315', '#161819', '#1e2124']}>
            <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4">
              <p className="text-h4 text-[var(--ds-fg)]">A post</p>
              <p className="mt-1 text-body-sm text-[var(--ds-fg-secondary)]">The blog and the CMS pages.</p>
              <PhButton v={B.gold} className="mt-3">
                SUBMIT
              </PhButton>
            </div>
          </GroundDemo>
          <GroundDemo name="Home · grey" vars={homeScope} ladder={['#101012', '#19191b', '#202023', '#28282c']}>
            <div className="rounded-2xl border border-[rgb(255_255_255/0.1)] bg-[var(--ds-surface)] p-4">
              <p className="text-h4 text-white">Five focused tools</p>
              <p className="mt-1 text-body-sm text-[var(--ds-fg-muted)]">Blue and gold become one light fill.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <PhButton v={HOME_FILL}>Login</PhButton>
                <PhButton v={HOME_FILL}>Start free</PhButton>
              </div>
            </div>
          </GroundDemo>
        </div>
      </Group>
    </BoardCard>

    {/* 08 ─ Surfaces & cards */}
    <BoardCard id="cards" n={8} title="Surfaces & Cards" lede="The containers content sits in, each on the ground it uses." span={3}>
      <Group label="Card">
        {/* A product page's "How it works" step, on the page. */}
        <Ground>
          <div className={cn(card, 'p-5')}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgb(91 98 224 / 0.1)', color: P.link }}>
              <Files size={20} aria-hidden />
            </div>
            <p className="text-h4 text-[var(--ds-fg)]">1 · Add every source</p>
            <p className="mt-2 text-body-sm text-[var(--ds-fg-secondary)]">PDFs, DOCX, audio and article URLs.</p>
            <PhButton v={B.primary} endIcon={<ArrowRight />} className="mt-4">
              Start free
            </PhButton>
          </div>
        </Ground>
      </Group>
      <Group label="Modal">
        <Stage>
          <AlertDialog tone={W.alerts.error!} icon={<CircleX size={24} />} message="Invalid credentials" action="OK" />
        </Stage>
      </Group>
      <Group label="Table">
        <SheetScope vars={interiorScope}>
          <Ground>
            <CmsTable />
          </Ground>
        </SheetScope>
      </Group>
    </BoardCard>

    <BoardColumn span={4}>
      {/* 09 ─ Feedback & status */}
      <BoardCard id="status" n={9} title="Feedback & Status" lede="Status keeps its color on every ground, the grey home page included.">
        <Group label="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge tone="success" dot>New</Badge>
            <Badge tone="info" dot>Update</Badge>
            <Badge tone="warning" dot>Coming soon</Badge>
            <Badge>Narrava Studio</Badge>
            <Badge variant="outline">In a post</Badge>
          </div>
        </Group>
        <Groups>
          <Group label="Checks">
            <ul className="flex flex-col gap-1.5 text-body-sm text-[var(--ds-fg-secondary)]">
              {['Source-attributed', 'Multi-source'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check size={16} style={{ color: P.emerald }} aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </Group>
          <Group label="Inline errors">
            <p className="text-body-sm" style={{ color: P.error }}>
              Search failed. Try again.
            </p>
            <p className="text-body-sm" style={{ color: P.error }}>
              Enter at least $5.
            </p>
          </Group>
        </Groups>
        <Group label="Empty state">
          {/* The release notes, filtered to a product with no notes yet. */}
          <div className="rounded-2xl border p-6" style={{ borderColor: W.levels[2].value, backgroundColor: 'rgb(18 24 38 / 0.6)', boxShadow: W.shadows[0].value }}>
            <p className="mb-1 font-medium text-[#e2ddd1]">Nothing here yet</p>
            <p className="text-body-sm text-[var(--ds-fg-muted)]">There are no notes for this product so far.</p>
          </div>
        </Group>
      </BoardCard>

      {/* 10 ─ Accessibility & interaction */}
      <BoardCard id="accessibility" n={10} title="Accessibility & Interaction" lede="What every page gets without asking for it.">
        <Tiles
          tiles={[
            {
              icon: <Contrast />,
              title: 'Color contrast',
              text: `Body text ${ratio(W.contrast.body)}, muted ${ratio(W.contrast.muted)} on the page. AA asks 4.5:1.`,
            },
            { icon: <SquareDashed />, title: 'Focus states', text: 'A 2px ring at 2px offset on every button, from the keyboard only.' },
            { icon: <Pointer />, title: 'Touch targets', text: 'On a touch screen every button answers across 44px, whatever its size.' },
            { icon: <Activity />, title: 'Reduced motion', text: "The hover wash stops fading in and sign-in's aurora stops moving." },
            { icon: <Type />, title: 'Type floor', text: `No text under ${TYPE_FLOOR}px — the caption, the scale's smallest step.` },
          ]}
        />
      </BoardCard>
    </BoardColumn>

    {/* 11 ─ Backdrops & footer */}
    <BoardCard
      id="backdrops"
      n={11}
      title="Backdrops & Footer"
      lede="The composed backgrounds, each sized to its box — anything larger paints black tiles on iOS."
      span={8}
    >
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))]">
        <Backdrop label="The surface, fading into the page" style={{ backgroundImage: 'linear-gradient(to bottom, #191f2e, #121826, #050b1a)' }}>
          <p className="text-overline uppercase" style={{ color: P.link }}>
            Research software
          </p>
          <p className="text-h4 text-[var(--ds-fg)]">Product hero</p>
        </Backdrop>
        <Backdrop label="Header navy, left to right" style={{ backgroundImage: P.band }}>
          <p className="text-h4 text-[var(--ds-fg)]">Closing call</p>
          <p className="text-body-sm text-[var(--ds-fg-secondary)]">A product page's last band.</p>
        </Backdrop>
        <Backdrop
          label="Violet rising from below"
          style={{ backgroundColor: '#0a0c1a', backgroundImage: 'linear-gradient(190deg, rgb(139 123 247 / 0) 25%, rgb(139 123 247 / 0.2) 100%)' }}
        >
          <p className="text-h4 text-[var(--ds-fg)]">Header over the hero</p>
        </Backdrop>
        <Backdrop
          label="Violet from the top, gold from below"
          style={{
            backgroundImage:
              'linear-gradient(205deg, rgb(94 116 216 / 0.3) 0%, rgb(94 116 216 / 0) 58%), linear-gradient(25deg, rgb(227 191 110 / 0.14) 0%, rgb(227 191 110 / 0) 48%), linear-gradient(to bottom, #2b3566, #050b1a, #050b1a)',
          }}
        >
          <p className="text-h4 text-[var(--ds-fg)]">Mobile menu</p>
        </Backdrop>
        <Backdrop label="Four lights, blurred together" style={{ backgroundColor: '#050b1a' }}>
          {/* Four soft lights, blurred together over the page. */}
          {[
            { w: '48%', l: '-8%', t: '-8%', c: '#5b62e0' },
            { w: '52%', r: '-12%', t: '16%', c: '#e3bf6e' },
            { w: '46%', l: '6%', b: '-16%', c: '#9eace8' },
            { w: '40%', r: '4%', b: '-8%', c: '#4b4ef0' },
          ].map((blob, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute aspect-square rounded-full opacity-55 mix-blend-screen blur-[36px]"
              style={{
                width: blob.w,
                left: blob.l,
                right: blob.r,
                top: blob.t,
                bottom: blob.b,
                backgroundImage: `radial-gradient(circle at 30% 30%, ${blob.c}, transparent 70%)`,
              }}
            />
          ))}
          <span aria-hidden className="absolute inset-0 bg-[rgb(0_0_0/0.2)]" />
          <p className="relative text-h4 text-white">Sign-in aurora</p>
        </Backdrop>
      </div>
      <Group label="Footer">
        <div className="overflow-x-auto">
          <footer className="min-w-[520px] rounded-xl py-10 text-white" style={{ backgroundColor: P.header }}>
            <div className="grid grid-cols-3 gap-6 px-4">
              {[
                { h: 'Company', links: ['Products', 'Release notes'] },
                { h: 'Products', links: ['Research Atlas', 'Chrono Origin'] },
                { h: 'Policies', links: ['Privacy Policy', 'Terms & Conditions'] },
              ].map((col) => (
                <section key={col.h}>
                  <h3 className="mb-3 text-overline uppercase">{col.h}</h3>
                  <ul className="flex flex-col gap-2 text-body-sm">
                    {col.links.map((l) => (
                      <li key={l}>
                        <a href="#backdrops" className="hover:text-[#e8c87e]">
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <p className="mt-6 text-center text-caption">© Phansora. All rights reserved.</p>
          </footer>
        </div>
      </Group>
    </BoardCard>

    {/* 12 ─ Alerts */}
    <BoardCard id="alerts" n={12} title="Alerts" lede="How a form answers: sent, failed, or something left out." span={4}>
      <Group label="Success · contact">
        <Stage>
          <AlertDialog tone={W.alerts.success!} icon={<CircleCheck size={24} />} message="Message sent successfully!" action="OK" />
        </Stage>
      </Group>
      <Group label="Warning · a field left empty">
        <Stage>
          <AlertDialog tone={W.alerts.warning!} icon={<TriangleAlert size={24} />} message="Email and password are required." action="OK" />
        </Stage>
      </Group>
      <Note>An error answers the same way, in red — the Modal in card 08.</Note>
    </BoardCard>

    {/* 13 ─ Content blocks */}
    <BoardCard
      id="content"
      n={13}
      title="Content Blocks"
      lede="A card that goes somewhere is a link as a whole: its title's anchor is stretched over it, so it has one tab stop."
      span={12}
      wide
    >
      <div className="grid gap-x-4 gap-y-[18px] [grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))]">
        <Group label="Product · home">
          <article className={homeCard}>
            <div className="relative">
              <img src={`${ASSETS}/chrono-origin.webp`} alt="" width={800} height={450} className="aspect-video w-full object-cover" />
              <span className="absolute left-3 top-3 rounded-full bg-[rgb(5_11_26/0.8)] px-2.5 py-1 text-overline uppercase text-white ring-1 ring-[rgb(255_255_255/0.15)]">
                New
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-h4 text-white">
                <a href="#content" className="after:absolute after:inset-0">
                  Chrono Origin
                </a>
              </h3>
              <p className="mt-1.5 text-body-sm text-[var(--ds-fg-muted)]">Find where a story began</p>
              <div className="mt-auto flex justify-end pt-5" aria-hidden>
                <span className="inline-grid h-9 w-9 place-items-center rounded-full bg-[var(--ds-canvas)] text-white ring-1 ring-[rgb(255_255_255/0.1)] transition-colors group-hover:bg-white group-hover:text-[#050b1a]">
                  <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </article>
        </Group>
        <Group label="Post · home">
          <article className={homeCard}>
            <img src={`${ASSETS}/post-cover.webp`} alt="" width={800} height={450} className="aspect-video w-full object-cover" />
            <div className="flex flex-1 flex-col p-5">
              <time className="text-overline uppercase text-[var(--ds-fg-muted)]">Jun 30, 2026</time>
              <h3 className="mt-2 text-h4 text-white">
                <a href="#content" className="after:absolute after:inset-0">
                  Which AI Platform Should I Use?
                </a>
              </h3>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-body-sm font-medium text-[var(--ds-fg)]" aria-hidden>
                Read More <ArrowRight size={16} />
              </span>
            </div>
          </article>
        </Group>
        <Group label="Post · blog index">
          <article className="rounded-xl border border-[var(--ds-border-interactive)] bg-[var(--ds-surface)] p-5">
            <p className="mb-1 text-overline uppercase" style={{ color: P.link }}>
              AI Tools &amp; Productivity
            </p>
            <h3 className="mb-1 text-h2 text-[var(--ds-fg)]">
              <a href="#content" className="hover:underline">
                Which AI Platform Should I Use?
              </a>
            </h3>
            <p className="mb-3 text-caption text-[var(--ds-fg-muted)]">Phansora · June 30, 2026</p>
            <p className="line-clamp-3 text-body-sm text-[var(--ds-fg-secondary)]">
              There is no single "best" AI platform — only the best one for what you are trying to do…
            </p>
            <a href="#content" className="mt-4 inline-flex items-center text-body-sm font-medium" style={{ color: P.link }}>
              Read article <span className="ml-1">↗</span>
            </a>
          </article>
        </Group>
        <Group label="Release note">
          <article className="min-w-0 border-l pl-5" style={{ borderColor: W.levels[2].value }}>
            <time className="mb-3 block text-body-sm font-medium text-[var(--ds-fg-muted)]">August 2, 2026</time>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone="warning" dot>
                Coming soon
              </Badge>
              <Badge>Narrava Studio</Badge>
              <a href="#content" className="text-[var(--ds-fg-muted)] hover:text-[#9eace8]" aria-label="Link to this update">
                #
              </a>
            </div>
            <h3 className="mb-4 text-h2 text-[var(--ds-fg)]">Narrava Studio, in final testing</h3>
            <p className="text-body text-[var(--ds-fg-secondary)]">Write or paste a script and have it timed into beats.</p>
          </article>
        </Group>
        <Group label="Audience & features">
          <div className={cn(card, 'p-5')}>
            <h3 className="text-body-sm font-medium text-[var(--ds-fg)]">Researchers &amp; academics</h3>
            <p className="mt-1.5 text-body-sm text-[var(--ds-fg-secondary)]">Build a knowledge base from primary sources.</p>
          </div>
          <ul className="mt-2 flex flex-col gap-4">
            {[
              { icon: <Layers size={20} />, h: 'Multi-source ingestion', t: 'PDFs, DOCX, audio and URLs.' },
              { icon: <Quote size={20} />, h: 'Per-section attribution', t: 'every paragraph cites its source.' },
            ].map((f) => (
              <li key={f.h} className="flex gap-3">
                <span className="mt-0.5 shrink-0" style={{ color: P.emerald }} aria-hidden>
                  {f.icon}
                </span>
                <p className="text-body-sm text-[var(--ds-fg-secondary)]">
                  <span className="font-medium text-[var(--ds-fg)]">{f.h}</span> — {f.t}
                </p>
              </li>
            ))}
          </ul>
        </Group>
        <Group label="Quote & question">
          <figure className="m-0 flex flex-col rounded-2xl border border-[rgb(255_255_255/0.1)] bg-[var(--ds-surface)] p-5">
            <blockquote className="text-[#e2ddd1]">“Research Atlas pulled ten messy sources into one clean, cited brief.”</blockquote>
            <figcaption className="mt-4 text-body-sm">
              <span className="block font-medium text-white">— Priya S.</span>
              <span className="block text-[var(--ds-fg-muted)]">Research analyst</span>
            </figcaption>
          </figure>
          <details className="group mt-2 border-y border-[rgb(255_255_255/0.1)] py-4" open>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body font-medium text-[var(--ds-fg)] hover:text-white">
              How do credits work?
              <ChevronDown size={20} className="shrink-0 text-[var(--ds-fg-muted)] transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-3 text-body-sm text-[var(--ds-fg-secondary)]">Every product draws from one shared credit balance.</p>
          </details>
        </Group>
        <Group label="Article">
          {/* A post's body, on the article ground. */}
          <SheetScope vars={interiorScope}>
            <Ground className="gap-4">
              <h3 className="text-h2 text-[var(--ds-fg)]">Why sources matter</h3>
              <p className="text-body text-[var(--ds-fg-secondary)]">
                A claim is only as strong as <strong className="font-semibold text-[var(--ds-fg)]">the trail behind it</strong>. Read the{' '}
                <a href="#content" className="underline underline-offset-2" style={{ color: '#8b9bf0' }}>
                  method
                </a>{' '}
                first.
              </p>
              <blockquote className="border-l-2 pl-4 italic text-[#d8d2c4]" style={{ borderColor: P.brand }}>
                The first source is rarely the one everyone quotes.
              </blockquote>
            </Ground>
          </SheetScope>
        </Group>
      </div>
    </BoardCard>
  </PhansoraSheet>
)

export default defineDoc({
  meta: {
    id: 'phansora-website',
    title: 'Phansora Website',
    tagline:
      'Second edition · October 2026. The Phansora public site on one board: its palette, type and buttons, its forms and navigation, its three grounds, and the blocks its pages are built from.',
    keywords: ['design sheet', 'style guide', 'phansora', 'website', 'marketing site', 'second edition'],
  },
  board: ({ onNavigate }) => <WebsiteBoard onNavigate={onNavigate} />,
})
