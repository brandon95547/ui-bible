import * as React from 'react'

/**
 * Which preview a stage is looking at, so it can offer to open itself in a
 * device window.
 *
 * Provided by DocPage, which is the only place that knows both the page id and
 * which block of it is being rendered. A stage used anywhere else gets null and
 * simply does not offer the button — there would be nothing to reopen.
 */
export interface PreviewContextValue {
  /** The doc page id, the same one the router uses. */
  pageId: string
  /** '' is the playground; otherwise the id of one named example. */
  blockId: string
  /**
   * True inside a device window. The stage drops its own chrome there: with a
   * real viewport to measure, a simulated width control and a border around the
   * specimen would both be describing something that is no longer true.
   */
  bare?: boolean
}

export const PreviewContext = React.createContext<PreviewContextValue | null>(null)

/**
 * Where a bare stage sends its knobs. The device window keeps them reachable
 * without spending viewport on them — the bar floats, so the page underneath is
 * still exactly the size of the device.
 */
export const DEVICE_CONTROLS_SLOT = 'uib-device-controls'

/** The route a device window opens. Hash-based, like every other route here. */
export const devicePath = (pageId: string, blockId?: string) =>
  `#/device/${pageId}${blockId ? `/${blockId}` : ''}`
