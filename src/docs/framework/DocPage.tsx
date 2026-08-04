import * as React from 'react'
import { ArrowLeft, ArrowRight, Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useScrollSpy } from '@/lib/hooks'
import { Badge } from '@/ui/Display'
import { Breadcrumbs } from '@/ui/Navigation'
import { PAGE_BY_ID } from '@/docs/nav'
import { currentSectionId, scrollToSection, sectionHref } from './anchors'
import { ColorPalette } from './ColorPalette'
import { PreviewContext } from './preview-context'
import { PreviewStage, Specimen } from './PreviewStage'
import {
  A11yPanel,
  AnatomyView,
  CodeBlock,
  GuidanceGrid,
  NotesGrid,
  PropsTable,
  Section,
  SizeTable,
  SubHeading,
  TokenTable,
} from './blocks'
import type { DocSpec } from './types'

interface DocPageProps {
  spec: DocSpec
  onNavigate: (id: string) => void
  isFavorite: boolean
  onToggleFavorite: () => void
  prev?: { id: string; title: string }
  next?: { id: string; title: string }
}

/**
 * Renders a DocSpec into the canonical page. The order is fixed and the
 * numbering is derived — a page cannot accidentally reorder itself.
 *
 * The live preview is section 1. Prose about a component is worth less than
 * the component itself, so nothing is allowed to sit above it.
 */
export function DocPage({
  spec,
  onNavigate,
  isFavorite,
  onToggleFavorite,
  prev,
  next,
}: DocPageProps) {
  const { meta } = spec

  // The tree in nav.ts is the single source of truth for where a page lives,
  // so a page moving between groups needs one edit, not two that can disagree.
  const navEntry = PAGE_BY_ID.get(meta.id)
  const trail = navEntry
    ? navEntry.path.split(' · ')
    : meta.group
      ? [meta.group]
      : []
  const aliases = navEntry?.aliases ?? []

  const sections = React.useMemo(() => {
    const out: { id: string; title: string }[] = []
    if (spec.preview) out.push({ id: 'preview', title: 'Live preview' })
    if (spec.anatomy) out.push({ id: 'anatomy', title: 'Anatomy' })
    if (spec.palette) out.push({ id: 'palette', title: 'Color palette' })
    if (spec.tokens?.length) out.push({ id: 'tokens', title: 'Design tokens' })
    if (spec.sizes?.length) out.push({ id: 'sizes', title: 'Recommended sizes' })
    if (spec.do?.length) out.push({ id: 'do', title: 'Do' })
    if (spec.dont?.length) out.push({ id: 'dont', title: "Don't" })
    if (spec.a11y) out.push({ id: 'accessibility', title: 'Accessibility' })
    if (spec.code) out.push({ id: 'code', title: 'Code' })
    if (spec.notes) out.push({ id: 'notes', title: 'Notes' })
    spec.appendix?.forEach((a) => out.push({ id: a.id, title: a.title }))
    return out
  }, [spec])

  const ids = React.useMemo(() => sections.map((s) => s.id), [sections])
  const activeSection = useScrollSpy(ids)
  const num = (id: string) => sections.findIndex((s) => s.id === id) + 1

  // Arriving on `#/colors#tokens` — pasted, bookmarked, or reloaded — has to
  // land on the section. The page's chunk resolves after the hash is read, so
  // by the time the browser would normally scroll there is nothing to find.
  React.useEffect(() => {
    const target = currentSectionId()
    if (!target) return
    const frame = requestAnimationFrame(() => scrollToSection(target, 'auto'))
    return () => cancelAnimationFrame(frame)
  }, [spec])

  return (
    <article className="relative">
      {/* ---- STICKY PAGE HEADER ------------------------------------------ */}
      <header className="sticky top-0 z-30 -mx-6 border-b border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]/85 px-6 pb-4 pt-5 backdrop-blur-xl sm:-mx-10 sm:px-10">
        {/* Must track the body container below (including its xl step) or the
            breadcrumb and h1 sit inset from the prose they introduce. */}
        <div className="mx-auto flex max-w-[64rem] flex-col gap-2.5 xl:max-w-[76rem]">
          <div className="flex items-center justify-between gap-4">
            <Breadcrumbs
              items={[
                { label: 'UI Bible', onClick: () => onNavigate('home') },
                ...trail.map((label) => ({ label })),
                { label: meta.title },
              ]}
            />
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
              className={cn(
                'grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-md)] transition-colors',
                isFavorite
                  ? 'text-[var(--ds-warning)]'
                  : 'text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
              )}
            >
              <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h1 text-[var(--ds-fg)]">{meta.title}</h1>
            {meta.status && meta.status !== 'stable' && (
              <Badge tone={meta.status === 'deprecated' ? 'danger' : 'warning'} size="sm">
                {meta.status}
              </Badge>
            )}
          </div>
          <p className="max-w-[68ch] text-body-lg text-[var(--ds-fg-muted)]">{meta.tagline}</p>
          {aliases.length > 0 && (
            // Stated up front, so someone who arrived looking for "modal"
            // learns the name we use before reading a single guideline. Muted,
            // not disabled: --ds-fg-disabled is 2.66:1 and this system exempts
            // it from contrast rules precisely because nothing readable may
            // use it.
            <p className="max-w-[68ch] text-caption text-[var(--ds-fg-muted)]">
              Also called {aliases.join(', ')} — in this system all of them are{' '}
              <span className="text-[var(--ds-fg-secondary)]">{meta.title}</span>.
            </p>
          )}
        </div>
      </header>

      {/* ---- BODY + TOC --------------------------------------------------- */}
      <div className="mx-auto flex max-w-[64rem] gap-10 pb-24 pt-10 xl:max-w-[76rem]">
        <div className="flex min-w-0 flex-1 flex-col gap-14">
          {/* 1 — LIVE PREVIEW */}
          {spec.preview && (
            <Section
              id="preview"
              index={num('preview')}
              title="Live preview"
              description="Everything below is the real component. Change the controls, tab through it, and turn on Inspector Mode to read any value off the screen."
            >
              {/* Each stage is told which block it is, so it can offer to
                  reopen exactly itself in a device window. This is the only
                  place that knows both halves of that address. */}
              <div className="flex flex-col gap-8">
                <PreviewContext.Provider value={{ pageId: meta.id, blockId: '' }}>
                  {spec.preview.render}
                </PreviewContext.Provider>

                {spec.preview.examples?.map((ex) => (
                  <div key={ex.id} id={ex.id} className="scroll-mt-28">
                    <SubHeading description={ex.description}>{ex.title}</SubHeading>
                    <PreviewContext.Provider value={{ pageId: meta.id, blockId: ex.id }}>
                      {ex.render}
                    </PreviewContext.Provider>
                  </div>
                ))}

                {spec.preview.states && spec.preview.states.length > 0 && (
                  <div>
                    <SubHeading description="Every state a user can put this component into, rendered side by side. If a state is missing here, it is missing in production too.">
                      Interaction states
                    </SubHeading>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {spec.preview.states.map((s) => (
                        <Specimen key={s.label} label={s.label} note={s.note}>
                          {s.render}
                        </Specimen>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* 2 — ANATOMY */}
          {spec.anatomy && (
            <Section
              id="anatomy"
              index={num('anatomy')}
              title="Anatomy"
              description="Every part, every measurement, and the reason it is that number."
            >
              <AnatomyView spec={spec.anatomy} />
            </Section>
          )}

          {/* 3 — COLOR PALETTE */}
          {spec.palette && (
            <Section
              id="palette"
              index={num('palette')}
              title="Color palette"
              description="Every colour in the active theme, resolved from the running stylesheet. Click any swatch to copy its value."
            >
              <ColorPalette />
            </Section>
          )}

          {/* 4 — TOKENS */}
          {spec.tokens && spec.tokens.length > 0 && (
            <Section
              id="tokens"
              index={num('tokens')}
              title="Design tokens used"
              description="Values are read live from the running stylesheet, so this table can never drift from the code. Click any value to copy it."
            >
              <TokenTable tokens={spec.tokens} />
            </Section>
          )}

          {/* 5 — SIZES */}
          {spec.sizes && spec.sizes.length > 0 && (
            <Section
              id="sizes"
              index={num('sizes')}
              title="Recommended sizes"
              description="Pick a size from this table. Do not invent a new one — a fourth height is how a design system starts dying."
            >
              <SizeTable rows={spec.sizes} />
            </Section>
          )}

          {/* 6 — DO */}
          {spec.do && spec.do.length > 0 && (
            <Section id="do" index={num('do')} title="Do">
              <GuidanceGrid items={spec.do} tone="do" />
            </Section>
          )}

          {/* 7 — DON'T */}
          {spec.dont && spec.dont.length > 0 && (
            <Section id="dont" index={num('dont')} title="Don't">
              <GuidanceGrid items={spec.dont} tone="dont" />
            </Section>
          )}

          {/* 8 — ACCESSIBILITY */}
          {spec.a11y && (
            <Section
              id="accessibility"
              index={num('accessibility')}
              title="Accessibility"
              description="Not a checklist to run at the end. These are the requirements the component was built from."
            >
              <A11yPanel spec={spec.a11y} />
            </Section>
          )}

          {/* 9 — CODE */}
          {spec.code && (
            <Section id="code" index={num('code')} title="Code">
              <div className="flex flex-col gap-6">
                {spec.code.usage && (
                  <div>
                    <SubHeading description={spec.code.usage.caption}>Example usage</SubHeading>
                    <CodeBlock
                      code={spec.code.usage.code}
                      lang={spec.code.usage.lang}
                      showLineNumbers
                    />
                  </div>
                )}
                {spec.code.html && (
                  <div>
                    <SubHeading description={spec.code.html.caption}>
                      Framework-free HTML
                    </SubHeading>
                    <CodeBlock code={spec.code.html.code} lang={spec.code.html.lang} />
                  </div>
                )}
                {spec.code.css && (
                  <div>
                    <SubHeading description={spec.code.css.caption}>CSS</SubHeading>
                    <CodeBlock code={spec.code.css.code} lang={spec.code.css.lang} />
                  </div>
                )}
                {spec.code.api && spec.code.api.length > 0 && (
                  <div className="flex flex-col gap-5">
                    <SubHeading>Component API</SubHeading>
                    {spec.code.api.map((a) => (
                      <PropsTable key={a.name} name={a.name} props={a.props} />
                    ))}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* 10 — NOTES */}
          {spec.notes && (
            <Section id="notes" index={num('notes')} title="Notes">
              <NotesGrid notes={spec.notes} />
            </Section>
          )}

          {/* APPENDIX */}
          {spec.appendix?.map((a) => (
            <Section
              key={a.id}
              id={a.id}
              index={num(a.id)}
              title={a.title}
              description={a.description}
            >
              {a.render}
            </Section>
          ))}

          {/* ---- PREV / NEXT --------------------------------------------- */}
          {(prev || next) && (
            <nav
              aria-label="Pagination"
              className="mt-6 grid gap-3 border-t border-[var(--ds-border-subtle)] pt-6 sm:grid-cols-2"
            >
              {prev ? (
                <button
                  type="button"
                  onClick={() => onNavigate(prev.id)}
                  className="group flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3.5 text-left transition-all hover:border-[var(--ds-border)] hover:bg-[var(--ds-layer-hover)]"
                >
                  <span className="flex items-center gap-1.5 text-caption text-[var(--ds-fg-muted)]">
                    <ArrowLeft size={12} /> Previous
                  </span>
                  <span className="text-label text-[var(--ds-fg)]">{prev.title}</span>
                </button>
              ) : (
                <span />
              )}
              {next && (
                <button
                  type="button"
                  onClick={() => onNavigate(next.id)}
                  className="group flex flex-col items-end gap-1 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3.5 text-right transition-all hover:border-[var(--ds-border)] hover:bg-[var(--ds-layer-hover)]"
                >
                  <span className="flex items-center gap-1.5 text-caption text-[var(--ds-fg-muted)]">
                    Next <ArrowRight size={12} />
                  </span>
                  <span className="text-label text-[var(--ds-fg)]">{next.title}</span>
                </button>
              )}
            </nav>
          )}
        </div>

        {/* ---- ON THIS PAGE ------------------------------------------------ */}
        <aside className="hidden w-52 shrink-0 xl:block">
          <nav aria-label="On this page" className="sticky top-[10.5rem] flex flex-col gap-2">
            <h2 className="px-2 text-overline uppercase text-[var(--ds-fg-muted)]">On this page</h2>
            <ul className="flex flex-col gap-px border-l border-[var(--ds-border-subtle)]">
              {sections.map((s, i) => {
                const active = activeSection === s.id
                return (
                  <li key={s.id}>
                    <a
                      href={sectionHref(s.id)}
                      onClick={() => requestAnimationFrame(() => scrollToSection(s.id))}
                      className={cn(
                        'relative flex items-baseline gap-2 py-1.5 pl-3 pr-2 text-caption transition-colors',
                        active
                          ? 'text-[var(--ds-fg)]'
                          : 'text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg-secondary)]',
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute -left-px top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--ds-accent)]"
                        />
                      )}
                      <span className="font-mono text-[10px] tabular-nums text-[var(--ds-fg-disabled)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {s.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>
      </div>
    </article>
  )
}

export { PreviewStage }
