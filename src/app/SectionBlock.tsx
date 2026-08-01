import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { iconByName } from '@/app/icons'
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
}: {
  section: NavSection
  onNavigate: (id: string) => void
  /** Off when the page title above already names the section. */
  headed?: boolean
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
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {group.pages.map((p) => (
                  <PageCard key={p.id} page={p} onNavigate={onNavigate} />
                ))}
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
        {!IMPLEMENTED.has(page.id) && (
          <span className="rounded-full bg-[var(--ds-layer-active)] px-1.5 text-[9px] uppercase text-[var(--ds-fg-muted)]">
            soon
          </span>
        )}
        <ArrowRight
          size={13}
          className="ml-auto shrink-0 -translate-x-1 text-[var(--ds-fg-disabled)] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
        />
      </span>
      <span className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">{page.blurb}</span>
      {page.aliases && page.aliases.length > 0 && (
        <span className="mt-0.5 truncate text-[11px] leading-relaxed text-[var(--ds-fg-muted)]">
          Also called {page.aliases.join(', ')}
        </span>
      )}
    </button>
  )
}
