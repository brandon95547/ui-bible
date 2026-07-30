import * as React from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { inspect } from '@/lib/inspect'
import { Checkbox } from './Toggle'

/* ===========================================================================
   DATA TABLE
   Tables are for comparison. If the user is not comparing rows against each
   other, a list of cards is easier to read and easier to make responsive.
   ======================================================================== */

export type Align = 'left' | 'right' | 'center'

export interface Column<T> {
  id: string
  header: React.ReactNode
  /** Cell renderer. Keep it pure — it runs on every row, every render. */
  cell: (row: T) => React.ReactNode
  /** Return a primitive for the built-in comparator. Omit to disable sorting. */
  sortBy?: (row: T) => string | number
  align?: Align
  width?: string
  /** Hidden below this breakpoint. Drop the least decision-relevant first. */
  hideBelow?: 'sm' | 'md' | 'lg'
  sticky?: boolean
  /** Renders in tabular figures. Use for every numeric column. */
  numeric?: boolean
}

export type SortState = { id: string; dir: 'asc' | 'desc' } | null

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  sort?: SortState
  onSortChange?: (s: SortState) => void
  selectable?: boolean
  selected?: Set<string>
  onSelectedChange?: (s: Set<string>) => void
  onRowClick?: (row: T) => void
  density?: 'compact' | 'normal' | 'relaxed'
  stickyHeader?: boolean
  emptyState?: React.ReactNode
  loading?: boolean
  caption?: string
  className?: string
  /** Highlights matched text and drives the empty state copy. */
  query?: string
}

const rowHeights = { compact: 'h-9', normal: 'h-11', relaxed: 'h-14' }
const cellPad = { compact: 'px-3', normal: 'px-3.5', relaxed: 'px-4' }

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  sort,
  onSortChange,
  selectable,
  selected,
  onSelectedChange,
  onRowClick,
  density = 'normal',
  stickyHeader,
  emptyState,
  loading,
  caption,
  className,
}: DataTableProps<T>) {
  const sorted = React.useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.id === sort.id)
    if (!col?.sortBy) return rows
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = col.sortBy!(a)
      const bv = col.sortBy!(b)
      if (av === bv) return 0
      return (av > bv ? 1 : -1) * dir
    })
  }, [rows, sort, columns])

  const allSelected = selectable && rows.length > 0 && rows.every((r) => selected?.has(rowKey(r)))
  const someSelected = selectable && rows.some((r) => selected?.has(rowKey(r))) && !allSelected

  const toggleAll = () => {
    if (!onSelectedChange) return
    onSelectedChange(allSelected ? new Set() : new Set(rows.map(rowKey)))
  }

  const cycleSort = (col: Column<T>) => {
    if (!col.sortBy || !onSortChange) return
    if (sort?.id !== col.id) onSortChange({ id: col.id, dir: 'asc' })
    else if (sort.dir === 'asc') onSortChange({ id: col.id, dir: 'desc' })
    else onSortChange(null)
  }

  const hideCls = (c: Column<T>) =>
    c.hideBelow === 'sm'
      ? 'hidden sm:table-cell'
      : c.hideBelow === 'md'
        ? 'hidden md:table-cell'
        : c.hideBelow === 'lg'
          ? 'hidden lg:table-cell'
          : ''

  return (
    <div
      className={cn(
        'relative overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]',
        className,
      )}
      {...inspect(`DataTable · ${density}`, {
        tokens: ['--ds-surface', '--ds-surface-inset', '--ds-border-subtle', '--text-body-sm'],
        why: 'Row height 44px at normal density: two 13px lines of metadata fit, and it clears the 44px touch minimum for a whole-row target. Horizontal rules only — vertical rules turn a scannable grid into a spreadsheet and add 20-odd lines of visual noise per screen.',
        a11y: 'A real <table> with <th scope>. aria-sort on the sorted header. Numeric columns are right-aligned with tabular figures so digits line up by place value.',
      })}
    >
      <table className="w-full border-collapse text-body-sm">
        {caption && <caption className="sr-only-ds">{caption}</caption>}
        <thead
          className={cn(
            'bg-[var(--ds-surface-inset)]',
            stickyHeader && 'sticky top-0 z-10 backdrop-blur-sm',
          )}
        >
          <tr className="border-b border-[var(--ds-border-subtle)]">
            {selectable && (
              <th scope="col" className={cn('w-10', cellPad[density])}>
                <Checkbox
                  size="sm"
                  checked={Boolean(allSelected)}
                  indeterminate={Boolean(someSelected)}
                  onChange={toggleAll}
                  aria-label={allSelected ? 'Deselect all rows' : 'Select all rows'}
                />
              </th>
            )}
            {columns.map((c) => {
              const isSorted = sort?.id === c.id
              return (
                <th
                  key={c.id}
                  scope="col"
                  style={{ width: c.width }}
                  aria-sort={
                    isSorted ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                  className={cn(
                    'h-9 whitespace-nowrap text-label-sm font-medium text-[var(--ds-fg-muted)]',
                    cellPad[density],
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center',
                    !c.align && 'text-left',
                    c.sticky && 'sticky left-0 z-10 bg-[var(--ds-surface-inset)]',
                    hideCls(c),
                  )}
                >
                  {c.sortBy ? (
                    <button
                      type="button"
                      onClick={() => cycleSort(c)}
                      className={cn(
                        'group -mx-1 inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] px-1 py-1',
                        'transition-colors hover:text-[var(--ds-fg)] focus-visible:outline-2 focus-visible:outline-[var(--ds-focus-ring)]',
                        isSorted && 'text-[var(--ds-fg)]',
                        c.align === 'right' && 'flex-row-reverse',
                      )}
                    >
                      {c.header}
                      <span aria-hidden className="shrink-0">
                        {isSorted ? (
                          sort!.dir === 'asc' ? (
                            <ArrowUp size={12} />
                          ) : (
                            <ArrowDown size={12} />
                          )
                        ) : (
                          <ChevronsUpDown
                            size={12}
                            className="opacity-0 transition-opacity group-hover:opacity-60"
                          />
                        )}
                      </span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody aria-busy={loading || undefined}>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-0">
                {emptyState}
              </td>
            </tr>
          )}
          {sorted.map((row) => {
            const key = rowKey(row)
            const isSel = selected?.has(key)
            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                data-selected={isSel || undefined}
                className={cn(
                  'border-b border-[var(--ds-border-subtle)] last:border-0',
                  'transition-colors duration-75',
                  rowHeights[density],
                  onRowClick && 'cursor-pointer',
                  isSel
                    ? 'bg-[var(--ds-layer-selected)]'
                    : 'hover:bg-[var(--ds-layer-hover)]',
                )}
              >
                {selectable && (
                  <td className={cellPad[density]} onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      size="sm"
                      checked={Boolean(isSel)}
                      onChange={() => {
                        if (!onSelectedChange) return
                        const next = new Set(selected)
                        if (next.has(key)) next.delete(key)
                        else next.add(key)
                        onSelectedChange(next)
                      }}
                      aria-label={`Select row ${key}`}
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td
                    key={c.id}
                    className={cn(
                      'text-[var(--ds-fg-secondary)]',
                      cellPad[density],
                      c.align === 'right' && 'text-right',
                      c.align === 'center' && 'text-center',
                      c.numeric && 'tabular-nums',
                      c.sticky && 'sticky left-0 bg-[var(--ds-surface)]',
                      hideCls(c),
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>

      {loading && (
        <div className="absolute inset-x-0 top-9 h-0.5 overflow-hidden">
          <div className="h-full w-full origin-left animate-[indeterminate_1.4s_cubic-bezier(0.2,0,0,1)_infinite] bg-[var(--ds-accent)]" />
        </div>
      )}
    </div>
  )
}

/* ===========================================================================
   TABLE TOOLBAR — search, filters, bulk actions
   ======================================================================== */

export function TableToolbar({
  children,
  selectedCount = 0,
  bulkActions,
  className,
}: {
  children?: React.ReactNode
  selectedCount?: number
  bulkActions?: React.ReactNode
  className?: string
}) {
  const hasSelection = selectedCount > 0
  return (
    <div
      className={cn(
        'relative flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] px-1 py-1',
        className,
      )}
      {...inspect('TableToolbar', {
        tokens: ['--ds-accent-subtle', '--radius-lg'],
        why: 'Bulk actions replace the filter row in place rather than appearing above it. Pushing the table down on every selection means the row you just clicked moves out from under your cursor.',
        a11y: 'The selection count lives in an aria-live region so screen-reader users hear “3 selected” without hunting for it.',
      })}
    >
      {hasSelection ? (
        <div className="flex w-full flex-wrap items-center gap-3 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] px-3 py-1.5">
          <span aria-live="polite" className="text-label text-[var(--ds-accent-text)]">
            {selectedCount} selected
          </span>
          <span className="ml-auto flex items-center gap-2">{bulkActions}</span>
        </div>
      ) : (
        children
      )}
    </div>
  )
}

/* ===========================================================================
   RESPONSIVE FALLBACK — the same rows as stacked cards below `md`
   ======================================================================== */

export function TableCardList<T>({
  rows,
  rowKey,
  columns,
  primary,
  onRowClick,
  className,
}: {
  rows: T[]
  rowKey: (r: T) => string
  columns: Column<T>[]
  primary: (r: T) => React.ReactNode
  onRowClick?: (r: T) => void
  className?: string
}) {
  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {rows.map((r) => (
        <li key={rowKey(r)}>
          <button
            type="button"
            onClick={() => onRowClick?.(r)}
            className="flex w-full flex-col gap-2.5 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3.5 text-left transition-colors hover:bg-[var(--ds-layer-hover)]"
          >
            <span className="text-label text-[var(--ds-fg)]">{primary(r)}</span>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {columns.map((c) => (
                <React.Fragment key={c.id}>
                  <dt className="text-caption text-[var(--ds-fg-muted)]">{c.header}</dt>
                  <dd
                    className={cn(
                      'text-caption text-[var(--ds-fg-secondary)]',
                      c.numeric && 'tabular-nums',
                    )}
                  >
                    {c.cell(r)}
                  </dd>
                </React.Fragment>
              ))}
            </dl>
          </button>
        </li>
      ))}
    </ul>
  )
}
