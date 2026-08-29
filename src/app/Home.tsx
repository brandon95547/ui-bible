import * as React from 'react'
import { ArrowRight, Crosshair, Command as CommandIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PageLink } from '@/app/PageLink'
import { Badge, Kbd } from '@/ui/Display'
import { Button } from '@/ui/Button'
import { iconByName } from '@/app/icons'
import { SectionBlock } from '@/app/SectionBlock'
import { NAV, ALL_PAGES } from '@/docs/nav'
import { useInspector } from './Inspector'

const PRINCIPLES = [
  {
    icon: 'Ruler',
    title: 'Nothing is arbitrary',
    body: 'Every number on every page traces back to a token, and every token traces back to a reason. If a value cannot be justified, it does not ship.',
  },
  {
    icon: 'Eye',
    title: 'Hierarchy before decoration',
    body: 'Size, weight, spacing and position do the work. Colour is the last tool reached for, not the first — it is the one that fails in greyscale, in sunlight, and for 300 million people.',
  },
  {
    icon: 'Accessibility',
    title: 'Accessible by construction',
    body: 'Contrast, focus order, keyboard paths and semantics are inputs to the design, not an audit performed on it afterwards.',
  },
  {
    icon: 'Gauge',
    title: 'Fast is a feature',
    body: 'Under 100ms feels instant. Over 400ms feels broken. Motion exists to explain what changed, never to prove that we can animate.',
  },
  {
    icon: 'Repeat2',
    title: 'Consistency over cleverness',
    body: 'A predictable interface is learned once. A delightful-but-novel one is re-learned on every screen, and the bill is paid by the user.',
  },
  {
    icon: 'Layers',
    title: 'One way to do each thing',
    body: 'Three button heights, not seven. Six elevation levels, not a shadow per component. Constraint is what makes a system a system.',
  },
]

export function Home({ onNavigate, onOpenPalette }: { onNavigate: (id: string) => void; onOpenPalette: () => void }) {
  const { toggle: toggleInspector, enabled: inspecting } = useInspector()
  const total = ALL_PAGES.length

  return (
    <div className="mx-auto max-w-[76rem] px-6 pb-24 pt-14 sm:px-10">
      {/* ---- HERO ---------------------------------------------------------- */}
      <header className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent" variant="subtle" dot>
            v1.0 · Living document
          </Badge>
          <Badge tone="neutral" variant="subtle">
            {total} pages
          </Badge>
          <Badge tone="neutral" variant="subtle">
            WCAG 2.2 AA
          </Badge>
        </div>

        <h1 className="max-w-[18ch] text-balance-ds text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.032em] text-[var(--ds-fg)]">
          The interface standard for everything we build.
        </h1>

        <p className="max-w-[62ch] text-body-lg leading-relaxed text-[var(--ds-fg-secondary)]">
          Not a component gallery and not documentation. This is the reasoning, the
          measurements and the working code behind every surface in our products — enough that a
          developer who has never designed anything can ship an interface indistinguishable from one
          we designed on purpose.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            endIcon={<ArrowRight />}
            onClick={() => onNavigate('design-tokens')}
          >
            Start with tokens
          </Button>
          <Button size="lg" variant="outlined" onClick={() => onNavigate('ux-rules')}>
            Read the UX rules
          </Button>
          <Button
            size="lg"
            variant="text"
            startIcon={<CommandIcon />}
            onClick={onOpenPalette}
          >
            Search everything
          </Button>
        </div>
      </header>

      {/* ---- INSPECTOR CALLOUT --------------------------------------------- */}
      <div className="mt-12 flex flex-col gap-4 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)] p-6 sm:flex-row sm:items-center sm:gap-8">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-lg)] bg-[var(--ds-accent)] text-white shadow-e2">
          <Crosshair size={20} />
        </span>
        <div className="flex-1">
          <h2 className="text-h4 text-[var(--ds-fg)]">Inspector Mode</h2>
          <p className="mt-1 max-w-[58ch] text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
            Turn it on and hover anything in this app — a button, a table row, this paragraph. You
            get its box model, typography, contrast ratio, the exact tokens behind it, and a
            sentence on why that value was chosen. Click to freeze the readout, <Kbd>Esc</Kbd> to
            leave.
          </p>
        </div>
        <Button
          variant={inspecting ? 'filled' : 'elevated'}
          onClick={toggleInspector}
          startIcon={<Crosshair />}
          className="shrink-0"
        >
          {inspecting ? 'Inspector on' : 'Turn on'}
        </Button>
      </div>

      {/* ---- PRINCIPLES ----------------------------------------------------- */}
      <section className="mt-16">
        <SectionLabel>Principles</SectionLabel>
        <h2 className="mt-2 text-h2">Six rules that produced everything else</h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-border-subtle)] sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p) => {
            const Icon = iconByName(p.icon)
            return (
              <div key={p.title} className="flex flex-col gap-3 bg-[var(--ds-surface)] p-5">
                <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] text-[var(--ds-accent-text)]">
                  <Icon size={16} />
                </span>
                <h3 className="text-label text-[var(--ds-fg)]">{p.title}</h3>
                <p className="text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">{p.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ---- ONE PURPOSE, ONE NAME ------------------------------------------ */}
      <section className="mt-16">
        <SectionLabel>The one-purpose rule</SectionLabel>
        <h2 className="mt-2 text-h2">One job each. One name each.</h2>
        <p className="mt-2 max-w-[68ch] text-body leading-relaxed text-[var(--ds-fg-muted)]">
          The industry ships four names for the same box — modal, dialog, popup, lightbox — and a
          developer choosing between them is doing archaeology instead of work. So every component
          in here does exactly one job no other component does, under exactly one name. Every other
          name is recorded as an alias: it is searchable, and it tells you what we call it instead.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Modal, Popup, Lightbox', 'dialog', 'Dialog'],
            ['Snackbar, Notification', 'toast', 'Toast'],
            ['Bottom Sheet, Side Sheet', 'drawer', 'Drawer'],
            ['Navigation Rail, Side Nav', 'sidebar', 'Sidebar'],
          ].map(([from, id, to]) => (
            <PageLink
              key={id}
              to={id}
              onNavigate={onNavigate}
              className={cn(
                'flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]',
                'bg-[var(--ds-surface)] px-3.5 py-3 text-left transition-colors',
                'hover:border-[var(--ds-border)] hover:bg-[var(--ds-surface-raised)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
              )}
            >
              <span className="min-w-0 flex-1 truncate text-caption text-[var(--ds-fg-muted)] line-through">
                {from}
              </span>
              <ArrowRight size={12} className="shrink-0 text-[var(--ds-fg-muted)]" />
              <span className="shrink-0 text-label-sm text-[var(--ds-accent-text)]">{to}</span>
            </PageLink>
          ))}
        </div>
      </section>

      {/* ---- BROWSE ---------------------------------------------------------- */}
      {/* The large sections are not listed here — 90-odd cards is a wall, not a
          welcome. They index themselves, from "Overview" at the top of each in
          the sidebar. What is left is short enough to read. */}
      <section className="mt-16">
        <SectionLabel>Contents</SectionLabel>
        <h2 className="mt-2 text-h2">The big sections index themselves</h2>
        <p className="mt-2 max-w-[62ch] text-body text-[var(--ds-fg-muted)]">
          Foundations, Components and Color each open with an Overview — the first row of the
          section in the sidebar, and its full contents. Everything else is short enough to list
          here.
        </p>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {NAV.filter((s) => s.overview).map((section) => {
            const Icon = iconByName(section.icon)
            const count = section.groups
              ? section.groups.reduce((n, g) => n + g.pages.length, 0)
              : (section.pages?.length ?? 0)
            return (
              <PageLink
                key={section.id}
                to={section.id}
                onNavigate={onNavigate}
                className={cn(
                  'group flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]',
                  'bg-[var(--ds-surface)] px-4 py-3.5 text-left transition-colors',
                  'hover:border-[var(--ds-border)] hover:bg-[var(--ds-surface-raised)]',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
                )}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]">
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="text-label text-[var(--ds-fg)]">{section.title}</span>
                    <span className="font-mono text-caption tabular-nums text-[var(--ds-fg-muted)]">
                      {count}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-caption text-[var(--ds-fg-muted)]">
                    {section.description}
                  </span>
                </span>
                <ArrowRight
                  size={14}
                  className="shrink-0 -translate-x-1 text-[var(--ds-fg-disabled)] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                />
              </PageLink>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col gap-12">
          {NAV.filter((s) => !s.overview).map((section) => (
            <SectionBlock key={section.id} section={section} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* ---- HOW TO USE ------------------------------------------------------ */}
      <section className="mt-16 rounded-[var(--radius-2xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-6 sm:p-8">
        <SectionLabel>How to use this</SectionLabel>
        <h2 className="mt-2 text-h3">Three rules for contributors</h2>
        <ol className="mt-5 flex flex-col gap-4">
          {[
            [
              'Take the closest thing that already exists.',
              'If a page here covers 80% of your case, use it and accept the other 20%. A near-match that everyone recognises beats a perfect one nobody has seen before.',
            ],
            [
              'If you must extend, extend the token, not the component.',
              'A new colour goes in the semantic tier and gets a name that says what it means. Hard-coding a hex into a component is how a system quietly dies.',
            ],
            [
              'Bring the reasoning with the change.',
              'Every page here answers “why is it this value?”. A contribution that cannot answer that question is a preference, and preferences do not belong in a standard.',
            ],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)] text-label-sm font-semibold text-[var(--ds-accent-text)]">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-label text-[var(--ds-fg)]">{title}</p>
                <p className="max-w-[68ch] text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-overline uppercase text-[var(--ds-accent-text)]">{children}</span>
  )
}
