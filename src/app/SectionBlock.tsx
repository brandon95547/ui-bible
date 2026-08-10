import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { iconByName } from '@/app/icons'
import { ComponentPreview } from '@/app/ComponentPreview'
import { IMPLEMENTED } from '@/docs/registry'
import type { NavGroup, NavPage, NavSection } from '@/docs/nav'

/**
 * One section rendered as a grid of page cards — the same block whether it is
 * standing alone on a section overview or stacked with its siblings on the
 * home page. A section that owns pages directly is treated as one group named
 * after itself, so both shapes take the same path.
 */
export function SectionBlock({
  section,
  onNavigate,
  headed = true,
  variant = 'text',
}: {
  section: NavSection
  onNavigate: (id: string) => void
  /** Off when the page title above already names the section. */
  headed?: boolean
  /**
   * `text` is the dense card — title, blurb, aliases — and is right for a list
   * you read. `preview` trades the words for a wireframe of the component
   * itself, which is what you actually want when you are looking for a shape
   * whose name you do not know yet.
   */
  variant?: 'text' | 'preview'
}) {
  const Icon = iconByName(section.icon)
  const groups: NavGroup[] = section.groups ?? [
    {
      id: section.id,
      title: section.title,
      icon: section.icon,
      description: section.description,
      pages: section.pages ?? [],
    },
  ]
  const total = groups.reduce((n, g) => n + g.pages.length, 0)

  return (
    <div>
      {headed && (
        <div className="flex flex-wrap items-baseline gap-2.5 border-b border-[var(--ds-border-subtle)] pb-3">
          <span className="text-[var(--ds-accent-text)]">
            <Icon size={17} />
          </span>
          <h3 className="text-h3">{section.title}</h3>
          <span className="font-mono text-caption tabular-nums text-[var(--ds-fg-muted)]">
            {total}
          </span>
          <p className="text-caption text-[var(--ds-fg-muted)]">{section.description}</p>
        </div>
      )}

      <div className={cn('flex flex-col gap-7', headed && 'mt-5')}>
        {groups.map((group) => {
          const GroupIcon = iconByName(group.icon)
          return (
            <div key={group.id}>
              {section.groups && (
                <div className="mb-3 flex items-baseline gap-2.5">
                  <span className="text-[var(--ds-fg-muted)]">
                    <GroupIcon size={14} />
                  </span>
                  <h4 className="text-h4">{group.title}</h4>
                  <p className="text-caption text-[var(--ds-fg-muted)]">{group.description}</p>
                </div>
              )}
              <div
                className={cn(
                  'grid sm:grid-cols-2 lg:grid-cols-3',
                  variant === 'preview' ? 'gap-4' : 'gap-2',
                )}
              >
                {group.pages.map((p) =>
                  variant === 'preview' ? (
                    <PreviewCard key={p.id} page={p} onNavigate={onNavigate} />
                  ) : (
                    <PageCard key={p.id} page={p} onNavigate={onNavigate} />
                  ),
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PageCard({ page, onNavigate }: { page: NavPage; onNavigate: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(page.id)}
      className={cn(
        'group flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]',
        'bg-[var(--ds-surface)] p-3.5 text-left transition-all duration-[160ms]',
        'hover:-translate-y-px hover:border-[var(--ds-border)] hover:bg-[var(--ds-surface-raised)] hover:shadow-e2',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
      )}
    >
      <span className="flex items-center gap-2">
        <span className="text-label text-[var(--ds-fg)]">{page.title}</span>
        <Soon page={page} />
        <ArrowRight
          size={13}
          className="ml-auto shrink-0 -translate-x-1 text-[var(--ds-fg-disabled)] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
        />
      </span>
      <span className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">{page.blurb}</span>
      {/* A page whose subject is a set of colours shows them. Six stops is
          enough to recognise a palette by and short enough not to turn the
          card into the page. */}
      {page.swatches && page.swatches.length > 0 && (
        <span
          aria-hidden
          className="mt-1.5 flex h-4 overflow-hidden rounded-[var(--radius-xs)] ring-1 ring-inset ring-[var(--ds-border-subtle)]"
        >
          {page.swatches.map((hex) => (
            <span key={hex} className="flex-1" style={{ background: hex }} />
          ))}
        </span>
      )}
      {page.aliases && page.aliases.length > 0 && (
        <span className="mt-0.5 truncate text-[11px] leading-relaxed text-[var(--ds-fg-muted)]">
          Also called {page.aliases.join(', ')}
        </span>
      )}
    </button>
  )
}

/**
 * The gallery card: a titled frame around a wireframe of the component.
 *
 * The drawing does the work the blurb used to. Sixty-five titles read as a
 * word list — sixty-five silhouettes read as a contact sheet, and someone who
 * knows the shape they need but not our name for it can point at it. The blurb
 * is not lost; it is the tooltip, the search result, and the first line of the
 * page itself.
 */
function PreviewCard({ page, onNavigate }: { page: NavPage; onNavigate: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(page.id)}
      title={page.blurb}
      className={cn(
        'group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]',
        'bg-[var(--ds-surface)] text-left transition-all duration-[160ms]',
        'hover:-translate-y-px hover:border-[var(--ds-border)] hover:shadow-e2',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
      )}
    >
      <span
        className={cn(
          'flex items-center gap-2 border-b border-[var(--ds-border-subtle)]',
          'bg-[var(--ds-layer-hover)] px-4 py-3',
        )}
      >
        <span className="truncate text-label text-[var(--ds-fg)]">{page.title}</span>
        <Soon page={page} />
        <ArrowUpRight
          size={15}
          className="ml-auto shrink-0 text-[var(--ds-fg-disabled)] transition-colors group-hover:text-[var(--ds-accent-text)]"
        />
      </span>
      <span className="flex min-h-[188px] flex-1 items-center justify-center overflow-hidden p-5">
        <ComponentPreview id={page.id} />
      </span>
    </button>
  )
}

function Soon({ page }: { page: NavPage }) {
  if (IMPLEMENTED.has(page.id)) return null
  return (
    <span className="shrink-0 rounded-full bg-[var(--ds-layer-active)] px-1.5 text-[9px] uppercase text-[var(--ds-fg-muted)]">
      soon
    </span>
  )
}
