import { Badge } from '@/ui/Display'
import { Breadcrumbs } from '@/ui/Navigation'
import { iconByName } from '@/app/icons'
import { SectionBlock } from '@/app/SectionBlock'
import { IMPLEMENTED } from '@/docs/registry'
import type { NavSection } from '@/docs/nav'

/**
 * The index for one section — the contents that used to sit on the home page,
 * moved to where you go looking for it. Reached from "Overview", the first row
 * of the section in the sidebar.
 */
export function SectionOverview({
  section,
  onNavigate,
}: {
  section: NavSection
  onNavigate: (id: string) => void
}) {
  const Icon = iconByName(section.icon)
  const pages = section.groups?.flatMap((g) => g.pages) ?? section.pages ?? []
  const written = pages.filter((p) => IMPLEMENTED.has(p.id)).length

  return (
    <div className="mx-auto max-w-[76rem] px-6 pb-24 pt-6 sm:px-10">
      <header className="flex flex-col gap-2.5 border-b border-[var(--ds-border-subtle)] pb-6">
        <Breadcrumbs
          items={[{ label: 'UI Bible', onClick: () => onNavigate('home') }, { label: section.title }]}
        />
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-lg)] bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]">
            <Icon size={18} />
          </span>
          <h1 className="text-h1 text-[var(--ds-fg)]">{section.title}</h1>
          <Badge tone="neutral" variant="subtle" size="sm">
            {pages.length} pages
          </Badge>
          {written < pages.length && (
            <Badge tone="neutral" variant="subtle" size="sm">
              {written} written
            </Badge>
          )}
        </div>
        <p className="max-w-[68ch] text-body-lg text-[var(--ds-fg-muted)]">{section.description}</p>
        <p className="max-w-[68ch] text-caption leading-relaxed text-[var(--ds-fg-muted)]">
          Every page follows the same ten sections in the same order — overview, live preview,
          anatomy, tokens, sizes, do, don’t, accessibility, code, notes. Learn the shape once and
          you can find anything in seconds.
        </p>
      </header>

      <div className="mt-8">
        <SectionBlock section={section} onNavigate={onNavigate} headed={false} />
      </div>
    </div>
  )
}
