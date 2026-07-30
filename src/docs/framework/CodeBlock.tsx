import * as React from 'react'
import { Check, Copy, WrapText } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCopy } from '@/lib/hooks'
import { highlight, type Lang } from './highlight'

export function CodeBlock({
  code,
  lang = 'tsx',
  caption,
  filename,
  showLineNumbers,
  maxHeight = 460,
  className,
}: {
  code: string
  lang?: Lang
  caption?: string
  filename?: string
  showLineNumbers?: boolean
  maxHeight?: number
  className?: string
}) {
  const { copied, copy } = useCopy()
  const [wrap, setWrap] = React.useState(false)
  const trimmed = React.useMemo(() => dedent(code), [code])
  const lines = React.useMemo(() => trimmed.split('\n'), [trimmed])

  return (
    <figure className={cn('flex flex-col', className)}>
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-sunken)]">
        <div className="flex items-center gap-2 border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-3 py-1.5">
          <span className="flex items-center gap-2 text-overline uppercase text-[var(--ds-fg-muted)]">
            {filename ? (
              <span className="font-mono text-[11px] normal-case tracking-normal text-[var(--ds-fg-secondary)]">
                {filename}
              </span>
            ) : (
              lang
            )}
          </span>
          <span className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setWrap((w) => !w)}
              aria-pressed={wrap}
              aria-label="Toggle line wrapping"
              className={cn(
                'grid h-6 w-6 place-items-center rounded-[var(--radius-xs)] transition-colors',
                wrap
                  ? 'bg-[var(--ds-layer-active)] text-[var(--ds-fg)]'
                  : 'text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
              )}
            >
              <WrapText size={13} />
            </button>
            <button
              type="button"
              onClick={() => copy(trimmed)}
              aria-label={copied ? 'Copied' : 'Copy code'}
              className="grid h-6 w-6 place-items-center rounded-[var(--radius-xs)] text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]"
            >
              {copied ? (
                <Check size={13} className="text-[var(--ds-success-text)]" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </span>
        </div>

        <div className="overflow-auto" style={{ maxHeight }}>
          <pre
            className={cn(
              'p-3.5 font-mono text-code leading-[1.7] text-[var(--ds-fg-secondary)]',
              wrap && 'whitespace-pre-wrap break-words',
            )}
          >
            <code>
              {showLineNumbers
                ? lines.map((line, i) => (
                    <span key={i} className="grid grid-cols-[2.25rem_1fr]">
                      <span className="select-none pr-3 text-right text-[var(--ds-fg-disabled)] tabular-nums">
                        {i + 1}
                      </span>
                      <span>{highlight(line, lang)}</span>
                    </span>
                  ))
                : highlight(trimmed, lang)}
            </code>
          </pre>
        </div>
      </div>
      {caption && (
        <figcaption className="mt-2 text-caption text-[var(--ds-fg-muted)]">{caption}</figcaption>
      )}
    </figure>
  )
}

/** Inline code, for prose. */
export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-[5px] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-1.5 py-px font-mono text-[0.86em] text-[var(--ds-accent-text)]">
      {children}
    </code>
  )
}

/** Removes the shared leading indentation of a template literal. */
export function dedent(src: string) {
  const lines = src.replace(/^\n/, '').replace(/\s+$/, '').split('\n')
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)![0].length)
  const min = indents.length ? Math.min(...indents) : 0
  return lines.map((l) => l.slice(min)).join('\n')
}
