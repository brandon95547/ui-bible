import * as React from 'react'
import { ArrowRight, Crosshair, Command as CommandIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge, Kbd } from '@/ui/Display'
import { Button } from '@/ui/Button'
import { iconByName } from '@/app/icons'
import { NAV, ALL_PAGES } from '@/docs/nav'
import { IMPLEMENTED } from '@/docs/registry'
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

      {/* ---- BROWSE ---------------------------------------------------------- */}
      <section className="mt-16">
        <SectionLabel>Contents</SectionLabel>
        <h2 className="mt-2 text-h2">Every section</h2>
        <p className="mt-2 max-w-[62ch] text-body text-[var(--ds-fg-muted)]">
          Every page follows the same ten sections in the same order — overview, live preview,
          anatomy, tokens, sizes, do, don’t, accessibility, code, notes. Learn the shape once and
          you can find anything in seconds.
        </p>

        <div className="mt-6 flex flex-col gap-8">
          {NAV.map((group) => {
            const Icon = iconByName(group.icon)
            return (
              <div key={group.id}>
                <div className="mb-3 flex items-baseline gap-2.5">
                  <span className="text-[var(--ds-accent-text)]">
                    <Icon size={15} />
                  </span>
                  <h3 className="text-h4">{group.title}</h3>
                  <p className="text-caption text-[var(--ds-fg-muted)]">{group.description}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.pages.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onNavigate(p.id)}
                      className={cn(
                        'group flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]',
                        'bg-[var(--ds-surface)] p-3.5 text-left transition-all duration-[160ms]',
                        'hover:-translate-y-px hover:border-[var(--ds-border)] hover:bg-[var(--ds-surface-raised)] hover:shadow-e2',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-label text-[var(--ds-fg)]">{p.title}</span>
                        {!IMPLEMENTED.has(p.id) && (
                          <span className="rounded-full bg-[var(--ds-layer-active)] px-1.5 text-[9px] uppercase text-[var(--ds-fg-muted)]">
                            soon
                          </span>
                        )}
                        <ArrowRight
                          size={13}
                          className="ml-auto shrink-0 -translate-x-1 text-[var(--ds-fg-disabled)] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </span>
                      <span className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">
                        {p.blurb}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
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
