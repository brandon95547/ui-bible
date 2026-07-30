import { Check, X } from 'lucide-react'
import { Button } from '@/ui/Button'
import { Badge, Kbd } from '@/ui/Display'
import { TextInput, Field } from '@/ui/Input'
import { Cell, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const POUR = [
  {
    letter: 'P',
    name: 'Perceivable',
    body: 'Information must be available to at least one sense the user has. Text alternatives, 4.5:1 contrast, no meaning carried by colour alone, content that reflows at 320px.',
  },
  {
    letter: 'O',
    name: 'Operable',
    body: 'Everything must work without a mouse. Full keyboard reach, visible focus, no traps, no time limits you cannot extend, targets of at least 44px.',
  },
  {
    letter: 'U',
    name: 'Understandable',
    body: 'Predictable behaviour and plain language. Consistent navigation, labels that stay put, errors that say what went wrong and how to fix it.',
  },
  {
    letter: 'R',
    name: 'Robust',
    body: 'Correct semantics so any assistive technology can interpret it — today’s screen readers and tomorrow’s. Native elements first, ARIA only to fill gaps.',
  },
]

function FocusDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Cell label="Visible focus ring" sub="2px solid, 2px offset, 3:1 against both" tone="good">
        <Row gap="sm">
          <Button className="outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]">
            Focused
          </Button>
          <Button variant="outlined">Tab to me</Button>
        </Row>
      </Cell>
      <Cell label="outline: none" sub="Keyboard users are now lost" tone="bad">
        <Row gap="sm">
          <Button style={{ outline: 'none' }}>Focused?</Button>
          <Button variant="outlined" style={{ outline: 'none' }}>
            Or this one?
          </Button>
        </Row>
      </Cell>
    </div>
  )
}

function ErrorDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Cell label="Says what and how" tone="good">
        <Field
          label="Work email"
          status="error"
          message="Enter an email that includes an @ — for example, ada@example.com"
          htmlFor="a11y-good"
        >
          <TextInput id="a11y-good" defaultValue="ada.example.com" status="error" />
        </Field>
      </Cell>
      <Cell label="Says neither" tone="bad">
        <Field label="Work email" status="error" message="Invalid input" htmlFor="a11y-bad">
          <TextInput id="a11y-bad" defaultValue="ada.example.com" status="error" />
        </Field>
      </Cell>
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'accessibility',
    title: 'Accessibility',
    group: 'Foundations',
    tagline:
      'WCAG 2.2 AA is the floor, not the goal. These are the constraints every component in this Bible was designed from — not a checklist run at the end.',
    keywords: ['a11y', 'wcag', 'aria', 'screen reader', 'keyboard', 'contrast', 'focus', 'semantics'],
  },

  overview: {
    purpose:
      'Accessibility is the discipline of not excluding people. Around one in six people has a disability that affects how they use software, and a much larger group is temporarily or situationally impaired — a broken wrist, bright sunlight, a noisy train, a phone held one-handed. Everything on this page benefits all of them, and none of it is a special case.',
    whenToUse: [
      'From the first sketch. Retrofitting accessibility costs several times what building it in does.',
      'When choosing an element: native semantics first, ARIA only where HTML has no equivalent.',
      'When designing any interaction: describe the keyboard path before the pointer path.',
      'When writing any message: state what happened and what to do about it.',
    ],
    whenNotToUse: [
      {
        text: 'Adding ARIA to an element that already has the right semantics.',
        instead: 'nothing — role="button" on a <button> is redundant and can break things',
      },
      {
        text: 'Using aria-label to change the visible name of a control.',
        instead: 'matching the accessible name to the visible text',
      },
      {
        text: 'Adding tabindex to non-interactive content so it can be focused.',
        instead: 'headings and landmarks, which screen readers already navigate',
      },
      {
        text: 'Disabling a control to prevent an invalid action.',
        instead: 'leaving it enabled and explaining the problem',
      },
    ],
    reasoning: (
      <>
        <p>
          The single highest-leverage rule is <strong>use the right element</strong>. A{' '}
          <code>&lt;button&gt;</code> is focusable, activates on Enter and Space, announces its
          role, participates in forms, and works with voice control — for free, in every browser. A{' '}
          <code>&lt;div onClick&gt;</code> has none of that, and the ARIA needed to fake it is four
          attributes and two keyboard handlers that almost nobody writes correctly.
        </p>
        <p>
          The corollary is the <strong>first rule of ARIA: do not use ARIA</strong>. Every attribute
          is a promise to assistive technology that you will keep it in sync with reality. A stale{' '}
          <code>aria-expanded</code> is worse than no attribute at all, because it actively lies —
          and no visual test will ever catch it.
        </p>
        <p>
          Finally: accessibility overlaps almost entirely with quality. Sufficient contrast helps
          everyone in sunlight. Keyboard support is what power users want. Clear error messages
          reduce support tickets. Semantic HTML is what makes automated testing possible. There is
          no version of this work that only helps a minority.
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="POUR" center={false} minHeight={0} allowResize={false}>
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {POUR.map((p) => (
            <div
              key={p.letter}
              className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] text-h4 font-bold text-[var(--ds-accent-text)]">
                {p.letter}
              </span>
              <div>
                <p className="text-label text-[var(--ds-fg)]">{p.name}</p>
                <p className="mt-1 text-caption leading-relaxed text-[var(--ds-fg-muted)]">
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </PreviewStage>
    ),
    examples: [
      {
        id: 'focus',
        title: 'Focus visibility',
        description:
          'The most common accessibility regression in production code is a designer asking for the "ugly blue outline" to be removed. Restyle it; never delete it.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <FocusDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'errors',
        title: 'Error messages',
        description:
          'An error must say what is wrong, why, and what a correct value looks like. "Invalid input" fails all three.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <ErrorDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'keyboard',
        title: 'The keyboard contract',
        description:
          'These bindings are the same in every component in this system. A user learns them once.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
              <table className="w-full border-collapse text-body-sm">
                <tbody>
                  {[
                    ['Tab / Shift+Tab', 'Move between focusable elements in DOM order'],
                    ['Enter', 'Activate a button or link; submit a form'],
                    ['Space', 'Activate a button; toggle a checkbox; scroll the page'],
                    ['↑ ↓ ← →', 'Move within a composite widget — tabs, radios, menus, listboxes'],
                    ['Home / End', 'Jump to the first or last item in a collection'],
                    ['Escape', 'Close the topmost overlay, one level at a time'],
                    ['Type-ahead', 'Jump to a matching option inside a listbox or select'],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-b border-[var(--ds-border-subtle)] last:border-0">
                      <td className="w-52 px-3 py-2 align-top">
                        <Kbd>{k}</Kbd>
                      </td>
                      <td className="px-3 py-2 text-[var(--ds-fg-muted)]">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Focus visible', render: <Button size="sm" className="outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]">Button</Button> },
      { label: 'AA text', note: '4.5:1', render: <span className="text-body-sm text-[var(--ds-fg-secondary)]">Body copy</span> },
      { label: 'AA large', note: '3:1', render: <span className="text-h4 text-[var(--ds-fg-muted)]">Heading</span> },
      { label: 'Target', note: '44 × 44 min', render: <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] border border-dashed border-[var(--ds-accent-border)] text-[10px] text-[var(--ds-accent-text)]">44</span> },
      { label: 'Redundant', note: 'Icon + colour + word', render: <Badge tone="danger" dot>Failed</Badge> },
      { label: 'Announced', note: 'aria-live', render: <span className="text-caption text-[var(--ds-success-text)]">3 items selected</span> },
      { label: 'Reduced motion', render: <span className="text-caption text-[var(--ds-fg-muted)]">durations → 1ms</span> },
      { label: 'Screen reader only', render: <span className="text-caption text-[var(--ds-fg-muted)]">.sr-only-ds</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4">
          {[
            ['1', 'Accessible name', 'What the control is called'],
            ['2', 'Role', 'What kind of thing it is'],
            ['3', 'State', 'checked, expanded, disabled, invalid'],
            ['4', 'Value', 'Current value, min, max'],
            ['5', 'Description', 'Supplementary help, wired with aria-describedby'],
          ].map(([n, k, v]) => (
            <div key={n} className="flex items-start gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--ds-accent-subtle)] text-[10px] font-bold text-[var(--ds-accent-text)]">
                {n}
              </span>
              <div>
                <p className="text-label-sm text-[var(--ds-fg)]">{k}</p>
                <p className="text-[11px] text-[var(--ds-fg-muted)]">{v}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    caption:
      'The five things assistive technology needs from every interactive element. Native HTML supplies most of them automatically; ARIA fills the gaps.',
    parts: [
      {
        n: 1,
        label: 'Accessible name',
        value: 'Visible text > aria-labelledby > aria-label',
        kind: 'type',
        note: 'Prefer the visible label. Voice-control users say what they see, so a mismatch between the visible text and the accessible name makes the control unusable for them.',
      },
      {
        n: 2,
        label: 'Role',
        value: 'Implicit from the element',
        kind: 'shape',
        note: 'A <button> is role="button" with no attributes. Adding the role explicitly is redundant; adding a different role usually breaks something.',
      },
      {
        n: 3,
        label: 'State',
        value: 'aria-checked, -expanded, -selected',
        kind: 'motion',
        note: 'Must update the instant the visual does. A stale state attribute is worse than none because it actively misinforms.',
      },
      {
        n: 4,
        label: 'Value',
        value: 'aria-valuenow / -valuemin / -valuemax',
        kind: 'size',
        note: 'For sliders, progress bars and meters. Omit valuenow entirely for indeterminate progress rather than sending 0.',
      },
      {
        n: 5,
        label: 'Description',
        value: 'aria-describedby',
        kind: 'space',
        note: 'Announced after the name and role. Correct for help text and validation messages; wrong for anything the user must have before acting.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-focus-ring', usedFor: 'The single focus indicator, used by every component' },
    { category: 'color', token: '--ds-fg', usedFor: 'Primary text, verified ≥13:1 in both themes' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Body copy, verified ≥7:1' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Captions, verified ≥4.6:1 — the tightest pair we ship' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'Error text on a tinted fill, verified ≥4.5:1' },
    { category: 'spacing', token: 'touch-target', value: '44 × 44px', usedFor: 'Minimum pointer target on coarse pointers' },
    { category: 'spacing', token: 'target-spacing', value: '8px', usedFor: 'Minimum clear space between adjacent targets' },
    { category: 'spacing', token: 'focus-offset', value: '2px', usedFor: 'Gap between the element and its focus ring' },
    { category: 'motion', token: 'prefers-reduced-motion', value: '0.01ms', usedFor: 'Collapsed duration, so transitionend still fires' },
  ],

  sizes: [
    { name: 'Body text', type: '≥4.5:1', use: 'Anything under 18.66px regular or 14px bold.' },
    { name: 'Large text', type: '≥3:1', use: '18.66px+ regular or 14px+ bold. Do not design to the exception.' },
    { name: 'UI boundaries', type: '≥3:1', use: 'Borders, icons and graphics that carry meaning.' },
    { name: 'Focus ring', type: '≥3:1', use: 'Against both the element and the adjacent background.' },
    { name: 'Touch target', height: '44 × 44px', touch: '44px', use: 'WCAG 2.2 AA minimum, with 8px of clear space.' },
    { name: 'Reflow', maxWidth: '320px', use: 'No horizontal scrolling at 320 CSS px, equal to 1280px at 400% zoom.' },
  ],

  do: [
    {
      title: 'Use the native element',
      why: 'A <button> gives you focus, Enter, Space, form participation, the correct role and voice-control support in every browser, for free. Everything else is you reimplementing it.',
      render: (
        <Stack gap="xs" className="font-mono text-[11px]">
          <span className="text-[var(--ds-success-text)]">&lt;button type="button"&gt;</span>
          <span className="text-[var(--ds-danger-text)]">&lt;div onClick={'{'}…{'}'}&gt;</span>
        </Stack>
      ),
    },
    {
      title: 'Make the accessible name match the visible label',
      why: 'WCAG 2.5.3. A voice-control user says "click Save"; if the aria-label is "Persist changes", nothing happens and there is no feedback explaining why.',
      render: (
        <Row gap="sm" align="center">
          <Button size="sm" aria-label="Save changes">Save changes</Button>
          <Check size={14} className="text-[var(--ds-success-text)]" />
        </Row>
      ),
    },
    {
      title: 'Announce dynamic changes',
      why: 'A screen-reader user does not see the row appear or the count change. An aria-live region is what makes an asynchronous update perceivable rather than silent.',
      render: (
        <span className="rounded-[var(--radius-sm)] bg-[var(--ds-accent-subtle)] px-2.5 py-1.5 text-caption text-[var(--ds-accent-text)]">
          <span className="font-mono text-[10px]">aria-live=&quot;polite&quot;</span> — 12 results
        </span>
      ),
    },
    {
      title: 'Write errors that say what to do',
      why: 'Naming the problem is half the job; showing a valid example is the other half. "Invalid input" is a dead end, and it is the most common error string in software.',
      render: (
        <span className="text-caption text-[var(--ds-success-text)]">
          Enter an email that includes an @ — for example, ada@example.com
        </span>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not remove the focus outline',
      why: 'It is the only way a keyboard user knows where they are. If it clashes with the design, restyle it — :focus-visible already hides it from mouse users.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          *:focus {'{'} outline: none; {'}'}
        </code>
      ),
    },
    {
      title: 'Do not use a placeholder as a label',
      why: 'It disappears the moment the user types, so anyone who is interrupted loses the field’s identity. It also usually fails contrast, and screen-reader support for it is inconsistent.',
      render: (
        <TextInput placeholder="Work email" className="max-w-[16rem]" />
      ),
    },
    {
      title: 'Do not convey state with colour alone',
      why: 'Roughly 300 million people cannot reliably distinguish red from green. Add an icon, a word, or a pattern — the greyscale test is the check.',
      render: (
        <Row gap="sm">
          <span className="h-6 w-16 rounded-[var(--radius-sm)]" style={{ background: '#35c98a' }} />
          <span className="h-6 w-16 rounded-[var(--radius-sm)]" style={{ background: '#fa6470' }} />
          <X size={14} className="self-center text-[var(--ds-danger-text)]" />
        </Row>
      ),
    },
    {
      title: 'Do not trap focus outside a modal',
      why: 'Tabbing out of a dialog into a page the user cannot see is completely disorienting. Trap inside modals; never trap anywhere else.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          Tab → an element behind the scrim → the user is now lost
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.1.1', name: 'Non-text Content', level: 'A' },
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.1.2', name: 'No Keyboard Trap', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.4.7', name: 'Focus Visible', level: 'AA' },
      { id: '2.4.11', name: 'Focus Not Obscured', level: 'AA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '3.3.3', name: 'Error Suggestion', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Body text 4.5:1. Large text and UI boundaries 3:1. Focus rings 3:1 against both neighbours.',
      'Alpha fills must be composited against their real background before measuring.',
      'Disabled controls are exempt — which is exactly why disabling is not an accessibility fix.',
      'Turn on Inspector Mode in this app and hover any text to see the live ratio.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Every interactive element, in DOM order, with a visible ring.' },
      { keys: 'Enter / Space', does: 'Activate. Enter also submits from inside a form field.' },
      { keys: 'Arrows', does: 'Move within composite widgets. Tab moves between them, not inside them.' },
      { keys: 'Escape', does: 'Dismiss the topmost layer and return focus to its trigger.' },
      { keys: 'Home / End', does: 'First and last item in a collection.' },
    ],
    aria: [
      { attr: 'aria-label', on: 'Controls with no visible text', note: 'Icon buttons only. Never to override a visible label.' },
      { attr: 'aria-labelledby', on: 'Dialogs, regions, groups', note: 'Preferred over aria-label — it points at real, visible, translatable text.' },
      { attr: 'aria-describedby', on: 'Fields with help or errors', note: 'Announced after the name. Multiple ids are allowed and are read in order.' },
      { attr: 'aria-live', on: 'Async status regions', note: 'polite waits for a pause; assertive interrupts. Use assertive only for errors.' },
      { attr: 'aria-expanded', on: 'Disclosure triggers', note: 'Must be on the trigger, not the panel, and must update synchronously with the visual state.' },
      { attr: 'aria-current', on: 'The active nav item', note: 'page for navigation, step for wizards, true for anything else.' },
      { attr: 'inert', on: 'Background behind a modal', note: 'Removes an entire subtree from focus and from the accessibility tree in one attribute.' },
    ],
    focus:
      'One ring for the entire system, 2px solid at 2px offset, applied with :focus-visible. It must never be obscured by a sticky header — set scroll-padding-top on the scroll container (WCAG 2.4.11).',
    screenReader: [
      'Test with a real one. VoiceOver on macOS is Cmd+F5; NVDA on Windows is free. Thirty minutes of real use teaches more than any checklist.',
      'Headings are the primary navigation mechanism. Do not skip levels, and never style a paragraph to look like a heading.',
      'Landmarks — main, nav, aside, header, footer — let users jump between regions. A page of divs offers no way to skip anything.',
      'Announce only what changed. A live region that re-reads an entire table on every update is worse than silence.',
    ],
    touch:
      '44 × 44 CSS pixels minimum with 8px of clear space, achieved with a pseudo-element overlay on coarse pointers so desktop density is unaffected.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// 1. The right element, with no ARIA at all
<button type="button" onClick={save}>Save changes</button>

// 2. Icon-only controls need a name
<button type="button" aria-label="Close dialog">
  <X aria-hidden />
</button>

// 3. Fields: a real label, plus described-by for help and errors
<label htmlFor="email">Work email</label>
<input
  id="email"
  type="email"
  aria-describedby="email-help email-error"
  aria-invalid={Boolean(error)}
/>
<p id="email-help">We only use this for billing receipts.</p>
{error && <p id="email-error" role="alert">{error}</p>}

// 4. Announce asynchronous changes
<div aria-live="polite" className="sr-only-ds">
  {results.length} results found
</div>

// 5. Modals: trap focus, restore it, make the rest inert
useFocusTrap(open, panelRef)
useScrollLock(open)
<div role="dialog" aria-modal="true" aria-labelledby={titleId}>

// 6. Skip link — the first focusable element on the page
<a href="#main" className="sr-only-ds focus:not-sr-only">Skip to content</a>`,
    },
    css: {
      lang: 'css',
      code: `/* One focus policy for the whole system */
:focus { outline: none; }
:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}

/* Visually hidden but present in the accessibility tree.
   display:none and visibility:hidden both remove it entirely. */
.sr-only-ds {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}

/* Touch targets grow only where there is a coarse pointer */
@media (pointer: coarse) {
  .control::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    top: 50%;
    block-size: 44px;
    transform: translateY(-50%);
  }
}

/* Sticky headers must not cover a focused element (WCAG 2.4.11) */
html { scroll-padding-block-start: 6.5rem; }

/* Collapse, do not remove */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`,
    },
  },

  notes: {
    tips: [
      'Unplug your mouse for an hour and use the product. It is the fastest accessibility audit that exists and it needs no tooling.',
      'Run axe DevTools in CI. Automated tools catch roughly 30–40% of issues, which is not everything but is the cheapest 40% you will ever get.',
      'Zoom to 400% and check that nothing scrolls horizontally. That is the actual WCAG reflow requirement and it fails more often than contrast does.',
      'Write the keyboard interaction into the ticket before writing the component. Retrofitting arrow-key navigation into a finished widget is always harder.',
    ],
    performance: [
      'A live region that updates on every keystroke floods the screen-reader queue. Debounce announcements to about 500ms.',
      'Very large accessibility trees slow screen readers down. Virtualise long lists and set aria-rowcount so the total is still announced.',
      'aria-hidden on a subtree is cheap; removing it from the DOM is cheaper. Prefer conditional rendering for anything genuinely absent.',
      'The inert attribute is more efficient than a JavaScript focus trap and handles pointer events too. Use it where support allows.',
    ],
    mistakes: [
      'Using aria-label on a container, which overrides the accessible names of everything inside it.',
      'Putting role="button" on a div and adding a click handler, then forgetting tabindex and the Space key.',
      'aria-hidden="true" on a focusable element. The user can tab to something the screen reader claims does not exist.',
      'Positive tabindex values. They jump ahead of the natural order and break the page for everyone. Only 0 and −1 are ever correct.',
      'Announcing every state change as assertive, which interrupts the user mid-sentence and makes the app hostile to listen to.',
    ],
    realWorld: [
      'Budget accessibility as part of the component, not as a follow-up ticket. Follow-up tickets are the ones that get cut.',
      'Include people with disabilities in usability testing. Automated checks and expert review both miss things that ten minutes of real use surfaces immediately.',
      'Publish a VPAT or accessibility statement. It is increasingly a procurement requirement, and writing it honestly forces the audit to actually happen.',
      'Keep a keyboard-only smoke test in CI: tab through the critical flow and assert that focus never lands on document.body. It catches an entire class of regression.',
    ],
  },
})
