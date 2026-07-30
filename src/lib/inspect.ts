/**
 * Metadata read by Inspector Mode.
 *
 * Every primitive tags itself with the semantic tokens it consumes and a
 * one-line rationale. The overlay measures geometry from the DOM; it cannot
 * know *why* a value was chosen, so the component has to say so.
 */
export interface InspectMeta {
  'data-inspect': string
  'data-tokens'?: string
  'data-why'?: string
  'data-a11y'?: string
}

export function inspect(
  name: string,
  opts: { tokens?: string[]; why?: string; a11y?: string } = {},
): InspectMeta {
  return {
    'data-inspect': name,
    ...(opts.tokens?.length ? { 'data-tokens': opts.tokens.join('|') } : {}),
    ...(opts.why ? { 'data-why': opts.why } : {}),
    ...(opts.a11y ? { 'data-a11y': opts.a11y } : {}),
  }
}
