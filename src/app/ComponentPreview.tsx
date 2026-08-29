import * as React from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Eye,
  Image as ImageIcon,
  Info,
  Minus,
  Play,
  Plus,
  Search,
  Sparkles,
  Star,
  User,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'

/* ============================================================================
   COMPONENT PREVIEWS
   ----------------------------------------------------------------------------
   A wireframe of each component, drawn at thumbnail scale for the Components
   overview. Deliberately abstract: bars instead of words, shapes instead of
   content. A reader scanning 65 cards is matching silhouettes, and real copy at
   9px is noise that gets in the way of that.

   Two rules hold the set together:

     1. Semantic tokens only. These render inside light and dark without a
        second definition, exactly like everything else in the system.
     2. Spans only. The card is an <a>, whose content model is phrasing
        content — so every primitive here is a span that has been told how to
        lay out. Divs would render, and would be invalid.
   ========================================================================= */

const TONE = {
  /* The faintest mark — background content, disabled things, empty tracks. */
  faint: 'bg-[var(--ds-border-strong)]',
  /* The default: a line of text. */
  line: 'bg-[var(--ds-fg-disabled)]',
  /* A heading, a label, a value that matters. */
  strong: 'bg-[var(--ds-fg-secondary)]',
  accent: 'bg-[var(--ds-accent)]',
  onAccent: 'bg-[var(--ds-accent-fg)]',
  danger: 'bg-[var(--ds-danger)]',
  success: 'bg-[var(--ds-success)]',
  warning: 'bg-[var(--ds-warning)]',
  /* A filled-but-neutral shape — a secondary button, a chip, an inset. */
  fill: 'bg-[var(--ds-layer-active)]',
} as const

type Tone = keyof typeof TONE

/* ---- primitives ---------------------------------------------------------- */

interface BoxProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

/** A rounded bar. The unit these drawings are made of. */
function Bar({
  w,
  h = 4,
  tone = 'line',
  className,
  style,
}: {
  w?: number | string
  h?: number
  tone?: Tone
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={cn('block shrink-0 rounded-full', TONE[tone], className)}
      style={{ width: w, height: h, ...style }}
    />
  )
}

function Dot({
  size = 7,
  tone = 'line',
  className,
  style,
}: {
  size?: number
  tone?: Tone
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={cn('block shrink-0 rounded-full', TONE[tone], className)}
      style={{ width: size, height: size, ...style }}
    />
  )
}

function Row({ className, style, children }: BoxProps) {
  return (
    <span className={cn('flex items-center', className)} style={style}>
      {children}
    </span>
  )
}

function Col({ className, style, children }: BoxProps) {
  return (
    <span className={cn('flex flex-col', className)} style={style}>
      {children}
    </span>
  )
}

/** The inner surface a preview sits on — a window, a sheet, a card. */
function Panel({ className, style, children }: BoxProps) {
  return (
    <span
      className={cn(
        'block rounded-[7px] border border-[var(--ds-border-subtle)] bg-[var(--ds-layer-hover)]',
        className,
      )}
      style={style}
    >
      {children}
    </span>
  )
}

/** A form control: the outlined box every input in the system is built from. */
function Field({
  w = 148,
  h = 21,
  className,
  style,
  children,
}: BoxProps & { w?: number; h?: number }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center gap-1.5 rounded-[5px] border border-[var(--ds-border)] px-2',
        className,
      )}
      style={{ width: w, height: h, ...style }}
    >
      {children}
    </span>
  )
}

/** A button, at the three levels of emphasis the system actually ships. */
function Btn({
  w = 56,
  h = 21,
  variant = 'filled',
  className,
  children,
}: {
  w?: number
  h?: number
  variant?: 'filled' | 'outlined' | 'text'
  className?: string
  children?: React.ReactNode
}) {
  const fill =
    variant === 'filled'
      ? 'bg-[var(--ds-accent)]'
      : variant === 'outlined'
        ? 'border border-[var(--ds-border)]'
        : ''
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center gap-1 rounded-[5px]', fill, className)}
      style={{ width: w, height: h }}
    >
      {children ?? (
        <Bar w={Math.round(w * 0.46)} h={4} tone={variant === 'filled' ? 'onAccent' : 'line'} />
      )}
    </span>
  )
}

/** A paragraph: n bars of tapering width. */
function Lines({
  ws,
  h = 4,
  gap = 5,
  tone = 'line',
  className,
}: {
  ws: number[]
  h?: number
  gap?: number
  tone?: Tone
  className?: string
}) {
  return (
    <Col className={className} style={{ gap }}>
      {ws.map((w, i) => (
        <Bar key={i} w={w} h={h} tone={tone} />
      ))}
    </Col>
  )
}

/** A lucide glyph at wireframe weight. */
function Ico({
  as: Icon,
  size = 11,
  className,
}: {
  as: LucideIcon
  size?: number
  className?: string
}) {
  return <Icon size={size} strokeWidth={2} className={cn('shrink-0 text-[var(--ds-fg-disabled)]', className)} />
}

const ACCENT_TEXT = 'text-[var(--ds-accent)]'

/* ---- shared fragments ---------------------------------------------------- */

/** The window chrome used by anything that draws a whole screen. */
function Chrome({ w = 208, className, children }: BoxProps & { w?: number }) {
  return (
    <Panel className={cn('overflow-hidden', className)} style={{ width: w }}>
      {children}
    </Panel>
  )
}

const QR_PATTERN = [
  '1111101011111',
  '1000111010001',
  '1010101110101',
  '1000111010001',
  '1111101011111',
  '0010010100100',
  '1011010110110',
  '0100101001010',
  '1111100110101',
  '1000101011001',
  '1010110100110',
  '1000101101010',
  '1111100110011',
]

/* ============================================================================
   THE DRAWINGS
   Ordered exactly as the nav orders them, so this file and the sidebar can be
   read side by side.
   ========================================================================= */

const PREVIEWS: Record<string, () => React.ReactElement> = {
  /* ---- NAVIGATION -------------------------------------------------------- */

  'app-bar': () => (
    <Chrome>
      <Row className="h-[27px] gap-2 border-b border-[var(--ds-border-subtle)] bg-[var(--ds-layer-active)] px-2.5">
        <Bar w={14} h={7} tone="accent" className="rounded-[3px]" />
        <Bar w={20} h={4} tone="strong" />
        <Bar w={15} h={4} />
        <Bar w={18} h={4} />
        <Dot size={13} tone="fill" className="ml-auto" />
      </Row>
      <Lines ws={[104, 168, 140]} tone="faint" className="p-2.5" />
    </Chrome>
  ),

  sidebar: () => (
    <Chrome className="flex h-[104px]">
      <Col className="w-[68px] gap-2.5 border-r border-[var(--ds-border-subtle)] bg-[var(--ds-layer-active)] p-2.5">
        <Row className="gap-1.5">
          <Dot size={7} tone="accent" />
          <Bar w={30} h={4} tone="strong" />
        </Row>
        <Row className="gap-1.5">
          <Dot size={7} tone="faint" />
          <Bar w={24} />
        </Row>
        <Row className="gap-1.5">
          <Dot size={7} tone="faint" />
          <Bar w={32} />
        </Row>
        <Row className="gap-1.5">
          <Dot size={7} tone="faint" />
          <Bar w={20} />
        </Row>
      </Col>
      <Lines ws={[64, 110, 92, 104]} tone="faint" className="flex-1 p-2.5" />
    </Chrome>
  ),

  'bottom-navigation': () => (
    <Chrome w={126} className="flex h-[122px] flex-col">
      <Lines ws={[70, 96, 82, 60]} tone="faint" className="flex-1 p-2.5" />
      <Row className="h-[30px] justify-around border-t border-[var(--ds-border-subtle)] bg-[var(--ds-layer-active)] px-2">
        {[0, 1, 2, 3].map((i) => (
          <Col key={i} className="items-center gap-1">
            <Dot size={9} tone={i === 0 ? 'accent' : 'line'} />
            <Bar w={12} h={3} tone={i === 0 ? 'accent' : 'faint'} />
          </Col>
        ))}
      </Row>
    </Chrome>
  ),

  tabs: () => (
    <Col className="w-[196px] gap-0">
      <Row className="gap-4 border-b border-[var(--ds-border)] px-1">
        <Col className="items-center gap-2 pb-1.5">
          <Bar w={34} h={5} tone="accent" />
          <Bar w={44} h={2} tone="accent" className="rounded-none" style={{ marginBottom: -1 }} />
        </Col>
        <Bar w={28} h={5} className="mb-[13px]" />
        <Bar w={36} h={5} className="mb-[13px]" />
      </Row>
      <Lines ws={[150, 178, 120]} tone="faint" className="pt-3.5" />
    </Col>
  ),

  breadcrumbs: () => (
    <Row className="gap-2">
      <Bar w={30} h={5} />
      <Ico as={ChevronRight} size={10} />
      <Bar w={40} h={5} />
      <Ico as={ChevronRight} size={10} />
      <Bar w={34} h={5} tone="accent" />
    </Row>
  ),

  pagination: () => (
    <Row className="gap-1.5">
      <Btn w={21} variant="outlined">
        <Ico as={ChevronLeft} size={10} />
      </Btn>
      {[0, 1, 2].map((i) => (
        <Btn key={i} w={21} variant={i === 1 ? 'filled' : 'outlined'}>
          <Bar w={6} h={6} tone={i === 1 ? 'onAccent' : 'line'} className="rounded-[2px]" />
        </Btn>
      ))}
      <Bar w={9} h={3} tone="faint" />
      <Btn w={21} variant="outlined">
        <Bar w={6} h={6} className="rounded-[2px]" />
      </Btn>
      <Btn w={21} variant="outlined">
        <Ico as={ChevronRight} size={10} />
      </Btn>
    </Row>
  ),

  menu: () => (
    <Col className="items-start gap-1.5">
      <Btn w={54} variant="outlined">
        <Bar w={22} h={4} />
        <Ico as={ChevronDown} size={9} />
      </Btn>
      <Panel className="w-[116px] bg-[var(--ds-layer-active)] p-1.5 shadow-e2">
        <Col className="gap-0.5">
          {[54, 68, 44].map((w, i) => (
            <Row
              key={w}
              className={cn('h-[17px] gap-1.5 rounded-[4px] px-1.5', i === 0 && 'bg-[var(--ds-accent-subtle)]')}
            >
              <Dot size={6} tone={i === 0 ? 'accent' : 'faint'} />
              <Bar w={w} tone={i === 0 ? 'strong' : 'line'} />
            </Row>
          ))}
          <Bar h={1} className="my-1 w-full rounded-none" tone="faint" />
          <Row className="h-[17px] gap-1.5 px-1.5">
            <Dot size={6} tone="faint" />
            <Bar w={58} />
          </Row>
        </Col>
      </Panel>
    </Col>
  ),

  'mega-menu': () => (
    <Col className="items-center gap-1.5">
      <Row className="gap-3">
        <Bar w={24} h={4} />
        <Bar w={30} h={4} tone="accent" />
        <Bar w={20} h={4} />
      </Row>
      <Panel className="w-[204px] bg-[var(--ds-layer-active)] p-2.5 shadow-e2">
        <Row className="items-start gap-3">
          {[0, 1, 2].map((c) => (
            <Col key={c} className="flex-1 gap-1.5">
              <Bar w={38} h={4} tone="strong" />
              <Bar className="w-full" h={3} tone="faint" />
              <Bar className="w-full" h={3} tone="faint" />
              <Bar w={40} h={3} tone="faint" />
            </Col>
          ))}
        </Row>
      </Panel>
    </Col>
  ),

  'tree-view': () => (
    <Col className="w-[150px] gap-2">
      <Row className="gap-1.5">
        <Ico as={ChevronDown} size={10} />
        <Bar w={62} h={5} tone="strong" />
      </Row>
      <Row className="gap-1.5 pl-3.5">
        <Ico as={ChevronDown} size={10} />
        <Bar w={54} h={5} />
      </Row>
      <Row className="gap-1.5 pl-7">
        <Dot size={5} tone="faint" />
        <Bar w={46} h={4} />
      </Row>
      <Row className="gap-1.5 pl-7">
        <Dot size={5} tone="faint" />
        <Bar w={58} h={4} />
      </Row>
      <Row className="gap-1.5 pl-3.5">
        <Ico as={ChevronRight} size={10} />
        <Bar w={48} h={5} />
      </Row>
    </Col>
  ),

  /* ---- ACTIONS ----------------------------------------------------------- */

  button: () => (
    <Col className="items-center gap-2">
      <Btn w={86} h={24} />
      <Btn w={86} h={24} variant="outlined" />
      <Btn w={86} h={24} variant="text" />
    </Col>
  ),

  'button-group': () => (
    <Row className="overflow-hidden rounded-[5px] border border-[var(--ds-border)]">
      {[0, 1, 2].map((i) => (
        <Row
          key={i}
          className={cn(
            'h-[24px] w-[52px] justify-center',
            i === 1 && 'bg-[var(--ds-accent)]',
            i > 0 && 'border-l border-[var(--ds-border)]',
          )}
        >
          <Bar w={22} h={4} tone={i === 1 ? 'onAccent' : 'line'} />
        </Row>
      ))}
    </Row>
  ),

  'split-button': () => (
    <Row>
      <Row className="h-[24px] w-[76px] justify-center rounded-l-[5px] bg-[var(--ds-accent)]">
        <Bar w={34} h={4} tone="onAccent" />
      </Row>
      <Row className="h-[24px] w-[22px] justify-center rounded-r-[5px] bg-[var(--ds-accent)] opacity-80">
        <Ico as={ChevronDown} size={11} className="text-[var(--ds-accent-fg)]" />
      </Row>
    </Row>
  ),

  toolbar: () => (
    <Panel className="flex h-[30px] items-center gap-1.5 bg-[var(--ds-layer-active)] px-2">
      {[0, 1].map((i) => (
        <Bar key={i} w={16} h={16} className="rounded-[4px]" tone="fill" />
      ))}
      <Bar w={1} h={14} className="mx-1 rounded-none" tone="faint" />
      {[0, 1, 2].map((i) => (
        <Bar
          key={i}
          w={16}
          h={16}
          className="rounded-[4px]"
          tone={i === 0 ? 'accent' : 'fill'}
        />
      ))}
      <Bar w={1} h={14} className="mx-1 rounded-none" tone="faint" />
      <Bar w={16} h={16} className="rounded-[4px]" tone="fill" />
    </Panel>
  ),

  'code-snippet': () => (
    <Panel className="w-[190px] bg-[var(--ds-sunken)] p-2.5">
      <Row className="items-start">
        <Col className="flex-1 gap-2">
          <Row className="gap-1.5">
            <Bar w={22} h={4} tone="accent" />
            <Bar w={38} h={4} tone="success" />
          </Row>
          <Row className="gap-1.5 pl-3">
            <Bar w={30} h={4} />
            <Bar w={46} h={4} tone="warning" />
          </Row>
          <Row className="gap-1.5">
            <Bar w={18} h={4} tone="accent" />
            <Bar w={26} h={4} />
          </Row>
        </Col>
        <Row className="h-[17px] w-[17px] justify-center rounded-[4px] bg-[var(--ds-layer-active)]">
          <Ico as={Copy} size={9} />
        </Row>
      </Row>
    </Panel>
  ),

  'command-palette': () => (
    <Panel className="w-[190px] overflow-hidden bg-[var(--ds-layer-active)] shadow-e3">
      <Row className="h-[26px] gap-2 border-b border-[var(--ds-border-subtle)] px-2.5">
        <Ico as={Search} size={11} />
        <Bar w={58} h={4} />
        <Bar w={2} h={11} className="rounded-none" tone="accent" />
      </Row>
      <Col className="gap-0.5 p-1.5">
        {[
          [78, true],
          [96, false],
          [64, false],
        ].map(([w, on], i) => (
          <Row
            key={i}
            className={cn('h-[18px] gap-2 rounded-[4px] px-1.5', on && 'bg-[var(--ds-accent-subtle)]')}
          >
            <Dot size={6} tone={on ? 'accent' : 'faint'} />
            <Bar w={w as number} tone={on ? 'strong' : 'line'} />
            <Bar w={12} h={9} className="ml-auto rounded-[2px]" tone="faint" />
          </Row>
        ))}
      </Col>
    </Panel>
  ),

  /* ---- INPUTS ------------------------------------------------------------ */

  'text-field': () => (
    <Col className="gap-1.5">
      <Bar w={44} h={4} tone="strong" />
      <Field>
        <Bar w={64} />
        <Bar w={1.5} h={11} className="rounded-none" tone="accent" />
      </Field>
      <Bar w={92} h={3} tone="faint" />
    </Col>
  ),

  textarea: () => (
    <Col className="gap-1.5">
      <Bar w={44} h={4} tone="strong" />
      <Col className="relative h-[58px] w-[148px] justify-start gap-2 rounded-[5px] border border-[var(--ds-border)] p-2">
        <Bar w={112} />
        <Bar w={128} />
        <Bar w={70} />
        <Ico as={ChevronDown} size={9} className="absolute bottom-0.5 right-0.5 -rotate-45" />
      </Col>
    </Col>
  ),

  'number-input': () => (
    <Field w={124} h={24} className="px-0 pl-2">
      <Bar w={28} tone="strong" />
      <Col className="ml-auto h-full w-[20px] border-l border-[var(--ds-border)]">
        <Row className="h-1/2 justify-center border-b border-[var(--ds-border)]">
          <Ico as={ChevronUp} size={9} />
        </Row>
        <Row className="h-1/2 justify-center">
          <Ico as={ChevronDown} size={9} />
        </Row>
      </Col>
    </Field>
  ),

  'password-input': () => (
    <Col className="gap-1.5">
      <Bar w={54} h={4} tone="strong" />
      <Field>
        <Row className="gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Dot key={i} size={5} tone="strong" />
          ))}
        </Row>
        <Ico as={Eye} size={11} className="ml-auto" />
      </Field>
      <Row className="gap-1">
        <Bar w={30} h={3} tone="success" />
        <Bar w={30} h={3} tone="success" />
        <Bar w={30} h={3} tone="faint" />
      </Row>
    </Col>
  ),

  'search-input': () => (
    <Field w={168} h={26} className="rounded-full">
      <Ico as={Search} size={12} />
      <Bar w={70} />
      <Bar w={16} h={11} className="ml-auto rounded-[3px]" tone="fill" />
    </Field>
  ),

  'phone-input': () => (
    <Field w={168} h={24} className="gap-2 pl-1.5">
      <Row className="gap-1 rounded-[3px] bg-[var(--ds-layer-active)] px-1.5 py-1">
        <Bar w={11} h={8} className="rounded-[2px]" tone="accent" />
        <Ico as={ChevronDown} size={8} />
      </Row>
      <Bar w={22} tone="strong" />
      <Bar w={34} tone="strong" />
      <Bar w={26} tone="strong" />
    </Field>
  ),

  'json-input': () => (
    <Panel className="w-[178px] bg-[var(--ds-sunken)] p-2.5">
      <Col className="gap-2">
        <Bar w={8} h={4} />
        <Row className="gap-1.5 pl-3">
          <Bar w={30} h={4} tone="accent" />
          <Bar w={44} h={4} tone="success" />
        </Row>
        <Row className="gap-1.5 pl-3">
          <Bar w={24} h={4} tone="accent" />
          <Bar w={16} h={4} tone="warning" />
        </Row>
        <Row className="gap-1.5 pl-6">
          <Bar w={28} h={4} tone="accent" />
          <Bar w={34} h={4} tone="success" />
        </Row>
        <Bar w={8} h={4} />
      </Col>
    </Panel>
  ),

  select: () => (
    <Col className="gap-1.5">
      <Bar w={40} h={4} tone="strong" />
      <Field>
        <Bar w={56} />
        <Ico as={ChevronDown} size={11} className="ml-auto" />
      </Field>
    </Col>
  ),

  combobox: () => (
    <Col className="gap-1">
      <Field className="border-[var(--ds-accent-border)]">
        <Bar w={30} tone="strong" />
        <Bar w={1.5} h={11} className="rounded-none" tone="accent" />
        <Ico as={ChevronDown} size={11} className="ml-auto" />
      </Field>
      <Panel className="w-[148px] bg-[var(--ds-layer-active)] p-1 shadow-e2">
        {[
          [70, true],
          [88, false],
          [56, false],
        ].map(([w, on], i) => (
          <Row
            key={i}
            className={cn('h-[17px] gap-1.5 rounded-[4px] px-1.5', on && 'bg-[var(--ds-accent-subtle)]')}
          >
            <Bar w={12} h={4} tone="accent" />
            <Bar w={(w as number) - 12} tone={on ? 'strong' : 'line'} />
          </Row>
        ))}
      </Panel>
    </Col>
  ),

  'multi-select': () => (
    <Field w={172} h={30} className="gap-1.5">
      {[26, 34, 20].map((w) => (
        <Row key={w} className="gap-1 rounded-[3px] bg-[var(--ds-accent-subtle)] px-1.5 py-1">
          <Bar w={w} h={4} tone="accent" />
          <Ico as={X} size={8} className={ACCENT_TEXT} />
        </Row>
      ))}
      <Ico as={ChevronDown} size={11} className="ml-auto" />
    </Field>
  ),

  'transfer-list': () => (
    <Row className="gap-2">
      <Panel className="w-[74px] p-1.5">
        <Col className="gap-1.5">
          {[40, 52, 34, 46].map((w, i) => (
            <Row key={w} className="gap-1">
              <Bar w={6} h={6} className="rounded-[2px]" tone={i < 2 ? 'accent' : 'faint'} />
              <Bar w={w} h={3} />
            </Row>
          ))}
        </Col>
      </Panel>
      <Col className="gap-1.5">
        <Btn w={20} h={18} variant="outlined">
          <Ico as={ArrowRight} size={10} className={ACCENT_TEXT} />
        </Btn>
        <Btn w={20} h={18} variant="outlined">
          <Ico as={ArrowLeft} size={10} />
        </Btn>
      </Col>
      <Panel className="w-[74px] p-1.5">
        <Col className="gap-1.5">
          {[44, 36].map((w) => (
            <Row key={w} className="gap-1">
              <Bar w={6} h={6} className="rounded-[2px]" tone="faint" />
              <Bar w={w} h={3} />
            </Row>
          ))}
        </Col>
      </Panel>
    </Row>
  ),

  checkbox: () => (
    <Col className="gap-2.5">
      <Row className="gap-2">
        <Row className="h-[14px] w-[14px] justify-center rounded-[4px] bg-[var(--ds-accent)]">
          <Ico as={Check} size={10} className="text-[var(--ds-accent-fg)]" />
        </Row>
        <Bar w={72} h={5} tone="strong" />
      </Row>
      <Row className="gap-2">
        <Row className="h-[14px] w-[14px] justify-center rounded-[4px] bg-[var(--ds-accent)]">
          <Ico as={Minus} size={10} className="text-[var(--ds-accent-fg)]" />
        </Row>
        <Bar w={56} h={5} />
      </Row>
      <Row className="gap-2">
        <Bar w={14} h={14} className="rounded-[4px] border border-[var(--ds-border-strong)] bg-transparent" />
        <Bar w={64} h={5} />
      </Row>
    </Col>
  ),

  'radio-button': () => (
    <Col className="gap-2.5">
      <Row className="gap-2">
        <Row className="h-[14px] w-[14px] justify-center rounded-full border-[4px] border-[var(--ds-accent)]" />
        <Bar w={72} h={5} tone="strong" />
      </Row>
      {[56, 64].map((w) => (
        <Row key={w} className="gap-2">
          <Bar w={14} h={14} className="rounded-full border border-[var(--ds-border-strong)] bg-transparent" />
          <Bar w={w} h={5} />
        </Row>
      ))}
    </Col>
  ),

  switch: () => (
    <Col className="gap-3">
      <Row className="gap-2.5">
        <Row className="h-[16px] w-[28px] justify-end rounded-full bg-[var(--ds-accent)] px-[3px]">
          <Dot size={10} tone="onAccent" />
        </Row>
        <Bar w={62} h={5} tone="strong" />
      </Row>
      <Row className="gap-2.5">
        <Row className="h-[16px] w-[28px] rounded-full bg-[var(--ds-layer-active)] px-[3px]">
          <Dot size={10} tone="faint" />
        </Row>
        <Bar w={48} h={5} />
      </Row>
    </Col>
  ),

  slider: () => (
    <Col className="w-[168px] gap-2.5">
      <Row className="relative h-[14px]">
        <Bar className="w-full" h={4} tone="fill" />
        <Bar w={98} h={4} tone="accent" className="absolute left-0" />
        <Dot
          size={14}
          tone="onAccent"
          className="absolute left-[92px] border-[3px] border-[var(--ds-accent)] shadow-e1"
        />
      </Row>
      <Row className="justify-between">
        {[0, 1, 2, 3, 4].map((i) => (
          <Bar key={i} w={2} h={5} className="rounded-none" tone="faint" />
        ))}
      </Row>
    </Col>
  ),

  'color-picker': () => (
    <Row className="items-end gap-2">
      <Col className="gap-1.5">
        <Bar
          w={78}
          h={54}
          className="rounded-[5px] bg-[linear-gradient(to_top_right,#000,transparent),linear-gradient(to_right,#fff,var(--p-brand-500))]"
        />
        {/* A hue wheel, so it has to be literal rather than tokenised — but the
            literals were the old iris/emerald/amber set and survived the palette
            swap looking like a different product. Spanish palette now. */}
        <Bar
          w={78}
          h={8}
          className="rounded-[3px] bg-[linear-gradient(to_right,#ff5252,#ffb142,#33d9b2,#34ace0,#706fd3,#ff5252)]"
        />
      </Col>
      <Col className="gap-1.5">
        {['--p-viz-1', '--p-viz-2', '--p-viz-3', '--p-viz-4'].map((v) => (
          <Bar key={v} w={13} h={13} className="rounded-[3px]" style={{ background: `var(${v})` }} />
        ))}
      </Col>
    </Row>
  ),

  'date-picker': () => (
    <Panel className="bg-[var(--ds-layer-active)] p-2.5 shadow-e2">
      <Col className="gap-2">
        <Row className="justify-between">
          <Ico as={ChevronLeft} size={10} />
          <Bar w={44} h={4} tone="strong" />
          <Ico as={ChevronRight} size={10} />
        </Row>
        <span className="grid grid-cols-7 gap-[5px]">
          {Array.from({ length: 28 }, (_, i) => (
            <Dot key={i} size={8} tone={i === 16 ? 'accent' : i < 3 || i > 24 ? 'faint' : 'line'} />
          ))}
        </span>
      </Col>
    </Panel>
  ),

  'time-picker': () => (
    <Field w={132} h={26} className="gap-2">
      <Ico as={Clock} size={12} />
      <Bar w={18} h={6} tone="strong" />
      <Col className="gap-[3px]">
        <Dot size={2.5} tone="line" />
        <Dot size={2.5} tone="line" />
      </Col>
      <Bar w={18} h={6} tone="strong" />
      <Bar w={16} h={5} className="ml-auto" />
    </Field>
  ),

  'file-upload': () => (
    <Col className="h-[80px] w-[168px] items-center justify-center gap-2 rounded-[7px] border border-dashed border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)]">
      <Ico as={ArrowUp} size={16} className={ACCENT_TEXT} />
      <Bar w={82} h={4} tone="strong" />
      <Bar w={54} h={3} tone="faint" />
    </Col>
  ),

  'pin-input': () => (
    <Row className="gap-2">
      {[0, 1, 2, 3].map((i) => (
        <Row
          key={i}
          className={cn(
            'h-[30px] w-[24px] justify-center rounded-[5px] border border-[var(--ds-border)]',
            i === 2 && 'border-[var(--ds-accent)]',
          )}
        >
          {i < 2 ? (
            <Dot size={7} tone="strong" />
          ) : i === 2 ? (
            <Bar w={1.5} h={13} className="rounded-none" tone="accent" />
          ) : null}
        </Row>
      ))}
    </Row>
  ),

  rating: () => (
    <Col className="items-center gap-2">
      <Row className="gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            size={17}
            strokeWidth={1.5}
            className={i < 4 ? 'fill-[var(--ds-warning)] text-[var(--ds-warning)]' : 'text-[var(--ds-fg-disabled)]'}
          />
        ))}
      </Row>
      <Bar w={62} h={4} tone="faint" />
    </Col>
  ),

  form: () => (
    <Col className="gap-2.5">
      {[38, 52].map((w) => (
        <Col key={w} className="gap-1">
          <Bar w={w} h={3} tone="strong" />
          <Field h={18} />
        </Col>
      ))}
      <Row className="gap-1.5">
        <Bar w={12} h={12} className="rounded-[3px]" tone="fill" />
        <Bar w={82} h={3} tone="faint" />
      </Row>
      <Row className="justify-end gap-1.5">
        <Btn w={40} h={19} variant="text" />
        <Btn w={52} h={19} />
      </Row>
    </Col>
  ),

  /* ---- FEEDBACK ---------------------------------------------------------- */

  dialog: () => (
    <Panel className="relative w-[204px] overflow-hidden bg-[var(--ds-layer-scrim)] p-3">
      <Panel className="bg-[var(--ds-surface-overlay)] p-2.5 shadow-e4">
        <Col className="gap-2">
          <Row>
            <Bar w={74} h={6} tone="strong" />
            <Ico as={X} size={11} className="ml-auto" />
          </Row>
          <Lines ws={[164, 140]} tone="faint" h={3} />
          <Row className="mt-1 justify-end gap-1.5">
            <Btn w={38} h={18} variant="outlined" />
            <Btn w={48} h={18} />
          </Row>
        </Col>
      </Panel>
    </Panel>
  ),

  toast: () => (
    <Col className="w-[196px] items-end gap-1.5">
      <Panel className="w-[152px] bg-[var(--ds-surface-overlay)] p-2 opacity-55 shadow-e2">
        <Row className="gap-2">
          <Dot size={9} tone="warning" />
          <Bar w={76} h={4} />
        </Row>
      </Panel>
      <Panel className="w-[168px] bg-[var(--ds-surface-overlay)] p-2.5 shadow-e3">
        <Row className="items-start gap-2">
          <Dot size={11} tone="success" />
          <Col className="flex-1 gap-1.5">
            <Bar w={66} h={4} tone="strong" />
            <Bar w={104} h={3} tone="faint" />
          </Col>
          <Ico as={X} size={10} />
        </Row>
      </Panel>
    </Col>
  ),

  banner: () => (
    <Chrome>
      <Row className="h-[26px] gap-2 border-b border-[var(--ds-info-border)] bg-[var(--ds-info-subtle)] px-2.5">
        <Ico as={Info} size={11} className="text-[var(--ds-info)]" />
        <Bar w={96} h={4} tone="strong" />
        <Bar w={30} h={4} tone="accent" />
        <Ico as={X} size={10} className="ml-auto" />
      </Row>
      <Lines ws={[104, 168, 132]} tone="faint" className="p-2.5" />
    </Chrome>
  ),

  tooltip: () => (
    <Col className="items-center gap-1.5">
      <Row className="rounded-[5px] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-overlay)] px-2.5 py-1.5 shadow-e3">
        <Bar w={58} h={4} tone="strong" />
      </Row>
      <Bar
        w={7}
        h={7}
        className="-mt-[4px] rotate-45 rounded-[1px] border-b border-r border-[var(--ds-border-subtle)] bg-[var(--ds-surface-overlay)]"
      />
      <Bar w={22} h={22} className="mt-1 rounded-[5px]" tone="fill" />
    </Col>
  ),

  popover: () => (
    <Col className="items-center gap-0">
      <Panel className="w-[150px] bg-[var(--ds-surface-overlay)] p-2.5 shadow-e3">
        <Col className="gap-2">
          <Row>
            <Bar w={54} h={5} tone="strong" />
            <Ico as={X} size={9} className="ml-auto" />
          </Row>
          <Lines ws={[124, 100]} h={3} tone="faint" />
          <Bar w={40} h={4} tone="accent" />
        </Col>
      </Panel>
      <Bar
        w={8}
        h={8}
        className="-mt-[4px] rotate-45 rounded-[1px] border-b border-r border-[var(--ds-border-subtle)] bg-[var(--ds-surface-overlay)]"
      />
      <Btn w={44} h={19} variant="outlined" className="mt-2" />
    </Col>
  ),

  'progress-indicator': () => (
    <Col className="items-center gap-4">
      <Col className="w-[150px] gap-1.5">
        <Row className="justify-between">
          <Bar w={40} h={3} tone="faint" />
          <Bar w={16} h={3} tone="faint" />
        </Row>
        <Row className="relative h-[6px]">
          <Bar className="w-full" h={6} tone="fill" />
          <Bar w={94} h={6} tone="accent" className="absolute left-0" />
        </Row>
      </Col>
      <Row className="gap-3">
        <span className="block h-[22px] w-[22px] rounded-full border-[3px] border-[var(--ds-layer-active)] border-t-[var(--ds-accent)]" />
        <Row className="gap-1">
          {[0, 1, 2].map((i) => (
            <Dot key={i} size={6} tone={i === 0 ? 'accent' : 'faint'} />
          ))}
        </Row>
      </Row>
    </Col>
  ),

  skeleton: () => (
    <Row className="w-[186px] animate-pulse items-start gap-2.5">
      <Dot size={30} tone="fill" />
      <Col className="flex-1 gap-2">
        <Bar className="w-full" h={7} tone="fill" />
        <Bar w={120} h={7} tone="fill" />
        <Bar w={92} h={7} tone="fill" />
        <Bar w={140} h={7} tone="fill" />
      </Col>
    </Row>
  ),

  /* ---- SURFACES ---------------------------------------------------------- */

  card: () => (
    <Panel className="w-[136px] overflow-hidden bg-[var(--ds-surface-raised)] shadow-e2">
      <Row className="h-[46px] justify-center bg-[var(--ds-layer-active)]">
        <Ico as={ImageIcon} size={16} />
      </Row>
      <Col className="gap-2 p-2.5">
        <Bar w={78} h={6} tone="strong" />
        <Lines ws={[112, 96, 104]} h={3} tone="faint" />
        <Row className="mt-1 gap-1.5">
          <Dot size={13} tone="fill" />
          <Bar w={40} h={3} tone="faint" />
          <Bar w={26} h={4} tone="accent" className="ml-auto" />
        </Row>
      </Col>
    </Panel>
  ),

  accordion: () => (
    <Panel className="w-[178px] overflow-hidden">
      <Col>
        <Row className="h-[24px] gap-2 border-b border-[var(--ds-border-subtle)] bg-[var(--ds-layer-active)] px-2.5">
          <Bar w={72} h={5} tone="strong" />
          <Ico as={ChevronUp} size={10} className="ml-auto" />
        </Row>
        <Lines ws={[152, 138, 96]} h={3} tone="faint" className="border-b border-[var(--ds-border-subtle)] p-2.5" />
        {[64, 84].map((w) => (
          <Row key={w} className="h-[24px] gap-2 border-b border-[var(--ds-border-subtle)] px-2.5 last:border-b-0">
            <Bar w={w} h={5} />
            <Ico as={ChevronDown} size={10} className="ml-auto" />
          </Row>
        ))}
      </Col>
    </Panel>
  ),

  drawer: () => (
    <Chrome className="flex h-[104px] bg-[var(--ds-layer-scrim)]">
      <Lines ws={[52, 76, 64]} h={3} tone="faint" className="flex-1 p-2.5 opacity-50" />
      <Col className="w-[96px] gap-2 border-l border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-2.5 shadow-e4">
        <Row>
          <Bar w={44} h={5} tone="strong" />
          <Ico as={X} size={10} className="ml-auto" />
        </Row>
        <Lines ws={[74, 60, 70]} h={3} tone="faint" />
        <Btn w={74} h={17} className="mt-auto" />
      </Col>
    </Chrome>
  ),

  backdrop: () => (
    <Panel className="relative flex h-[104px] w-[186px] items-center justify-center overflow-hidden">
      <Lines ws={[150, 120, 138, 96]} h={4} tone="faint" className="absolute left-3 top-3 opacity-70" />
      <Row className="absolute inset-0 items-center justify-center bg-[var(--ds-layer-scrim)] backdrop-blur-[1px]">
        <Panel className="bg-[var(--ds-surface-overlay)] px-4 py-3 shadow-e4">
          <Col className="gap-1.5">
            <Bar w={62} h={5} tone="strong" />
            <Bar w={44} h={3} tone="faint" />
          </Col>
        </Panel>
      </Row>
    </Panel>
  ),

  divider: () => (
    <Col className="w-[178px] gap-3">
      <Lines ws={[152, 128]} h={4} tone="faint" />
      <Bar className="w-full" h={1} tone="faint" />
      <Lines ws={[168, 104]} h={4} tone="faint" />
      <Row className="gap-2">
        <Bar className="flex-1" h={1} tone="faint" />
        <Bar w={30} h={4} tone="line" />
        <Bar className="flex-1" h={1} tone="faint" />
      </Row>
      <Lines ws={[140]} h={4} tone="faint" />
    </Col>
  ),

  carousel: () => (
    <Col className="items-center gap-2">
      <Row className="relative h-[76px] w-[168px] justify-center rounded-[7px] bg-[var(--ds-layer-active)]">
        <Ico as={ImageIcon} size={20} />
        <Row className="absolute left-1.5 h-[18px] w-[18px] justify-center rounded-full bg-[var(--ds-surface-overlay)] shadow-e1">
          <Ico as={ChevronLeft} size={10} />
        </Row>
        <Row className="absolute right-1.5 h-[18px] w-[18px] justify-center rounded-full bg-[var(--ds-surface-overlay)] shadow-e1">
          <Ico as={ChevronRight} size={10} />
        </Row>
      </Row>
      <Row className="gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <Dot key={i} size={5} tone={i === 1 ? 'accent' : 'faint'} />
        ))}
      </Row>
    </Col>
  ),

  jumbotron: () => (
    <Col className="w-[188px] items-center gap-2.5 rounded-[7px] bg-[var(--ds-accent-subtle)] px-4 py-5">
      <Bar w={38} h={9} className="rounded-[4px]" tone="accent" />
      <Bar w={140} h={8} tone="strong" />
      <Bar w={104} h={8} tone="strong" />
      <Lines ws={[152, 118]} h={3} tone="faint" className="items-center" />
      <Row className="mt-1 gap-2">
        <Btn w={54} h={20} />
        <Btn w={54} h={20} variant="outlined" />
      </Row>
    </Col>
  ),

  /* ---- DATA DISPLAY ------------------------------------------------------ */

  avatar: () => (
    <Col className="items-center gap-3">
      <Row className="h-[30px] w-[30px] justify-center rounded-full bg-[var(--ds-layer-active)]">
        <Ico as={User} size={16} />
      </Row>
      <Row>
        {['--p-viz-1', '--p-viz-2', '--p-viz-4'].map((v, i) => (
          <span
            key={v}
            className="block h-[22px] w-[22px] rounded-full border-2 border-[var(--ds-surface)]"
            style={{ background: `var(${v})`, marginLeft: i ? -7 : 0 }}
          />
        ))}
        <Row
          className="h-[22px] w-[22px] justify-center rounded-full border-2 border-[var(--ds-surface)] bg-[var(--ds-layer-active)]"
          style={{ marginLeft: -7 }}
        >
          <Bar w={9} h={3} tone="line" />
        </Row>
      </Row>
      <Row className="gap-2">
        <Row className="relative h-[22px] w-[22px] justify-center rounded-full bg-[var(--ds-layer-active)]">
          <Ico as={User} size={12} />
          <Dot
            size={7}
            tone="success"
            className="absolute bottom-0 right-0 border-2 border-[var(--ds-surface)]"
          />
        </Row>
        <Col className="gap-1.5">
          <Bar w={54} h={4} tone="strong" />
          <Bar w={38} h={3} tone="faint" />
        </Col>
      </Row>
    </Col>
  ),

  badge: () => (
    <Col className="items-center gap-3">
      <Row className="relative">
        <Btn w={62} h={22} variant="outlined" />
        <Dot size={9} tone="danger" className="absolute -right-1 -top-1 border-2 border-[var(--ds-surface)]" />
      </Row>
      <Row className="gap-1.5">
        {(['accent', 'success', 'warning'] as const).map((t) => (
          <Row
            key={t}
            className="rounded-full px-2 py-1"
            style={{ background: `var(--ds-${t === 'accent' ? 'accent' : t}-subtle)` }}
          >
            <Bar w={t === 'success' ? 22 : 16} h={4} tone={t} />
          </Row>
        ))}
      </Row>
    </Col>
  ),

  chip: () => (
    <Col className="items-center gap-2">
      <Row className="gap-1.5">
        <Row className="gap-1.5 rounded-full bg-[var(--ds-accent-subtle)] px-2 py-1.5">
          <Dot size={6} tone="accent" />
          <Bar w={26} h={4} tone="accent" />
          <Ico as={X} size={8} className={ACCENT_TEXT} />
        </Row>
        <Row className="gap-1.5 rounded-full bg-[var(--ds-layer-active)] px-2 py-1.5">
          <Bar w={32} h={4} />
          <Ico as={X} size={8} />
        </Row>
      </Row>
      <Row className="gap-1.5">
        <Row className="gap-1.5 rounded-full bg-[var(--ds-layer-active)] px-2 py-1.5">
          <Bar w={20} h={4} />
          <Ico as={X} size={8} />
        </Row>
        <Row className="rounded-full border border-dashed border-[var(--ds-border-strong)] px-2 py-1.5">
          <Bar w={28} h={4} tone="faint" />
        </Row>
      </Row>
    </Col>
  ),

  list: () => (
    <Panel className="w-[178px] overflow-hidden">
      {[
        [72, 104],
        [58, 92],
        [80, 112],
      ].map(([a, b], i) => (
        <Row
          key={i}
          className={cn(
            'h-[32px] gap-2.5 px-2.5',
            i < 2 && 'border-b border-[var(--ds-border-subtle)]',
            i === 0 && 'bg-[var(--ds-layer-hover)]',
          )}
        >
          <Dot size={16} tone="fill" />
          <Col className="gap-1.5">
            <Bar w={a} h={4} tone="strong" />
            <Bar w={b} h={3} tone="faint" />
          </Col>
          <Ico as={ChevronRight} size={10} className="ml-auto" />
        </Row>
      ))}
    </Panel>
  ),

  'data-table': () => (
    <Panel className="w-[200px] overflow-hidden">
      <Row className="h-[20px] gap-2 border-b border-[var(--ds-border)] bg-[var(--ds-layer-active)] px-2">
        <Bar w={8} h={8} className="rounded-[2px] border border-[var(--ds-border-strong)] bg-transparent" />
        <Bar w={40} h={3} tone="strong" />
        <Bar w={28} h={3} tone="strong" />
        <Bar w={24} h={3} tone="strong" />
        <Row className="ml-auto gap-0.5">
          <Ico as={ChevronUp} size={8} />
        </Row>
      </Row>
      {[0, 1, 2, 3].map((r) => (
        <Row
          key={r}
          className={cn(
            'h-[20px] gap-2 px-2',
            r < 3 && 'border-b border-[var(--ds-border-subtle)]',
            r === 1 && 'bg-[var(--ds-accent-subtle)]',
          )}
        >
          <Bar
            w={8}
            h={8}
            className={cn(
              'rounded-[2px]',
              r === 1 ? 'bg-[var(--ds-accent)]' : 'border border-[var(--ds-border-strong)] bg-transparent',
            )}
          />
          <Bar w={40} h={3} />
          <Bar w={28} h={3} tone="faint" />
          <Bar w={24} h={3} tone="faint" />
          <Bar w={16} h={5} className="ml-auto rounded-full" tone={r === 0 ? 'success' : 'faint'} />
        </Row>
      ))}
    </Panel>
  ),

  timeline: () => (
    <Col className="w-[168px]">
      {[
        [72, 128, true],
        [58, 104, false],
        [66, 92, false],
      ].map(([a, b, on], i, all) => (
        <Row key={i} className="items-stretch gap-2.5">
          <Col className="items-center">
            <Dot size={10} tone={on ? 'accent' : 'line'} className="mt-[1px] shrink-0" />
            {i < all.length - 1 && <span className="block w-px flex-1 bg-[var(--ds-border-strong)]" />}
          </Col>
          <Col className="gap-1.5 pb-4">
            <Bar w={a as number} h={5} tone={on ? 'strong' : 'line'} />
            <Bar w={b as number} h={3} tone="faint" />
          </Col>
        </Row>
      ))}
    </Col>
  ),

  gallery: () => (
    <span className="grid w-[172px] auto-rows-[34px] grid-cols-3 gap-1.5">
      <Row className="col-span-2 row-span-2 justify-center rounded-[5px] bg-[var(--ds-layer-active)]">
        <Ico as={ImageIcon} size={18} />
      </Row>
      {[0, 1, 2, 3, 4].map((i) => (
        <Row key={i} className="justify-center rounded-[5px] bg-[var(--ds-layer-active)]">
          <Ico as={ImageIcon} size={11} />
        </Row>
      ))}
    </span>
  ),

  chart: () => (
    <Col className="w-[178px] gap-2">
      <Row className="items-end gap-2.5 border-b border-l border-[var(--ds-border)] px-2 pb-0 pt-1">
        {[26, 40, 20, 52, 34, 60].map((h, i) => (
          <Bar
            key={i}
            w={16}
            h={h}
            tone={i === 5 ? 'accent' : 'fill'}
            className="rounded-b-none rounded-t-[3px]"
          />
        ))}
      </Row>
      <Row className="gap-2.5 pl-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Bar key={i} w={16} h={3} tone="faint" />
        ))}
      </Row>
    </Col>
  ),

  'qr-code': () => (
    <Panel className="bg-[var(--ds-layer-active)] p-2.5">
      <span className="grid gap-[1px]" style={{ gridTemplateColumns: 'repeat(13, 5px)' }}>
        {QR_PATTERN.flatMap((row, y) =>
          row.split('').map((cell, x) => (
            <span
              key={`${x}-${y}`}
              className={cn('block h-[5px] w-[5px]', cell === '1' && 'bg-[var(--ds-fg-secondary)]')}
            />
          )),
        )}
      </span>
    </Panel>
  ),

  'ai-label': () => (
    <Col className="items-center gap-2.5">
      <Row className="gap-1.5 rounded-full border border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)] px-2.5 py-1.5">
        <Ico as={Sparkles} size={11} className={ACCENT_TEXT} />
        <Bar w={44} h={4} tone="accent" />
      </Row>
      <Panel className="w-[168px] p-2.5">
        <Lines ws={[142, 120, 148, 84]} h={4} tone="faint" />
      </Panel>
    </Col>
  ),

  kbd: () => (
    <Row className="gap-2">
      {[30, 26, 26].map((w, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Ico as={Plus} size={9} />}
          <Row
            className="justify-center rounded-[5px] border border-b-2 border-[var(--ds-border-strong)] bg-[var(--ds-layer-active)]"
            style={{ width: w, height: 26 }}
          >
            <Bar w={w - 14} h={5} tone="strong" />
          </Row>
        </React.Fragment>
      ))}
    </Row>
  ),

  /* ---- MEDIA ------------------------------------------------------------- */

  image: () => (
    <Col className="gap-2">
      <Row className="h-[76px] w-[168px] justify-center rounded-[7px] bg-[var(--ds-layer-active)]">
        <Ico as={ImageIcon} size={22} />
      </Row>
      <Bar w={104} h={3} tone="faint" />
    </Col>
  ),

  video: () => (
    <Col className="w-[172px] gap-0 overflow-hidden rounded-[7px] bg-[var(--ds-layer-active)]">
      <Row className="h-[76px] justify-center">
        <Row className="h-[28px] w-[28px] justify-center rounded-full bg-[var(--ds-surface-overlay)] pl-[2px] shadow-e2">
          <Ico as={Play} size={13} className="fill-[var(--ds-fg-secondary)] text-[var(--ds-fg-secondary)]" />
        </Row>
      </Row>
      <Row className="h-[18px] gap-2 border-t border-[var(--ds-border-subtle)] px-2">
        <Ico as={Play} size={8} />
        <Row className="relative h-[3px] flex-1">
          <Bar className="w-full" h={3} tone="faint" />
          <Bar w={52} h={3} tone="accent" className="absolute left-0" />
        </Row>
        <Bar w={14} h={3} tone="faint" />
      </Row>
    </Col>
  ),

  link: () => (
    <Col className="w-[172px] gap-2">
      <Row className="gap-1.5">
        <Bar w={40} h={4} tone="faint" />
        <Bar w={54} h={4} tone="faint" />
        <Bar w={30} h={4} tone="faint" />
      </Row>
      <Row className="gap-1.5">
        <Bar w={26} h={4} tone="faint" />
        <Col className="gap-[3px]">
          <Bar w={62} h={4} tone="accent" />
          <Bar w={62} h={1} tone="accent" className="rounded-none" />
        </Col>
        <Bar w={34} h={4} tone="faint" />
      </Row>
      <Row className="gap-1.5">
        <Col className="gap-[3px]">
          <Bar w={48} h={4} tone="accent" />
          <Bar w={48} h={1} tone="accent" className="rounded-none" />
        </Col>
        <Ico as={ArrowRight} size={10} className={cn(ACCENT_TEXT, '-rotate-45')} />
        <Bar w={56} h={4} tone="faint" />
      </Row>
    </Col>
  ),
}

/** Anything without a drawing of its own — a generic document. */
function Fallback() {
  return (
    <Panel className="w-[168px] p-3">
      <Lines ws={[64, 142, 120, 136, 88]} h={4} tone="faint" />
    </Panel>
  )
}

/**
 * Decorative by construction — the card's own label already names the
 * component, so the drawing is hidden from assistive tech rather than
 * described twice.
 */
export function ComponentPreview({ id, className }: { id: string; className?: string }) {
  const Draw = PREVIEWS[id] ?? Fallback
  return (
    <span
      aria-hidden="true"
      className={cn('pointer-events-none flex select-none items-center justify-center', className)}
    >
      <Draw />
    </span>
  )
}
