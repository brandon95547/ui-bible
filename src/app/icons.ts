import {
  Accessibility,
  Blocks,
  BrainCircuit,
  Circle,
  Compass,
  Eye,
  Gauge,
  LayoutGrid,
  Layers,
  MessageSquareWarning,
  MousePointerClick,
  Repeat2,
  Ruler,
  SquareStack,
  Star,
  TextCursorInput,
  type LucideIcon,
} from 'lucide-react'

/**
 * An explicit allow-list rather than `import * as Icons`. A namespace import
 * of an icon library defeats tree-shaking and drags ~600 kB of unused SVG
 * into the entry chunk — the single most common bundle mistake in React apps.
 */
export const ICONS: Record<string, LucideIcon> = {
  Accessibility,
  Blocks,
  BrainCircuit,
  Circle,
  Compass,
  Eye,
  Gauge,
  Layers,
  LayoutGrid,
  MessageSquareWarning,
  MousePointerClick,
  Repeat2,
  Ruler,
  SquareStack,
  Star,
  TextCursorInput,
}

export function iconByName(name: string): LucideIcon {
  return ICONS[name] ?? Circle
}
