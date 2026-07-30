import * as React from 'react'

/**
 * A deliberately small tokenizer. Shiki/Prism would be more accurate, but they
 * cost 300–900 kB and this file only ever highlights short, well-formed
 * snippets that we author ourselves. Correctness here is bounded by taste,
 * not by parsing a hostile input.
 */

export type Lang = 'tsx' | 'ts' | 'jsx' | 'js' | 'html' | 'css' | 'bash' | 'json' | 'text'

interface Rule {
  re: RegExp
  cls: string
}

const JS_KEYWORDS =
  'const|let|var|function|return|if|else|import|from|export|default|interface|type|extends|implements|new|class|async|await|for|while|switch|case|break|continue|try|catch|finally|typeof|instanceof|as|in|of|null|undefined|true|false|this|void|readonly|public|private|protected|static|enum|namespace|declare|satisfies|keyof|infer'

const RULES: Record<Lang, Rule[]> = {
  tsx: [
    { re: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, cls: 'tok-com' },
    { re: /`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, cls: 'tok-str' },
    { re: /<\/?[A-Za-z][\w.]*/g, cls: 'tok-tag' },
    { re: new RegExp(`\\b(?:${JS_KEYWORDS})\\b`, 'g'), cls: 'tok-key' },
    { re: /\b\d+(?:\.\d+)?(?:px|rem|em|ms|s|%)?\b/g, cls: 'tok-num' },
    { re: /\b[a-zA-Z_$][\w$]*(?=\s*=)/g, cls: 'tok-attr' },
  ],
  html: [
    { re: /<!--[\s\S]*?-->/g, cls: 'tok-com' },
    { re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, cls: 'tok-str' },
    { re: /<\/?[a-zA-Z][\w-]*/g, cls: 'tok-tag' },
    { re: /\b[a-zA-Z-]+(?==)/g, cls: 'tok-attr' },
  ],
  css: [
    { re: /\/\*[\s\S]*?\*\//g, cls: 'tok-com' },
    { re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, cls: 'tok-str' },
    { re: /--[\w-]+/g, cls: 'tok-key' },
    { re: /[a-z-]+(?=\s*:)/g, cls: 'tok-attr' },
    { re: /#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|ms|s|%|vh|vw|dvh|fr)?\b/g, cls: 'tok-num' },
  ],
  bash: [
    { re: /#[^\n]*/g, cls: 'tok-com' },
    { re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, cls: 'tok-str' },
    { re: /(?:^|\n)\s*[a-z][\w-]*/g, cls: 'tok-key' },
    { re: /\s--?[\w-]+/g, cls: 'tok-attr' },
  ],
  json: [
    { re: /"(?:[^"\\]|\\.)*"(?=\s*:)/g, cls: 'tok-key' },
    { re: /"(?:[^"\\]|\\.)*"/g, cls: 'tok-str' },
    { re: /\b(?:true|false|null)\b/g, cls: 'tok-key' },
    { re: /-?\b\d+(?:\.\d+)?\b/g, cls: 'tok-num' },
  ],
  text: [],
  ts: [],
  js: [],
  jsx: [],
}
RULES.ts = RULES.tsx
RULES.js = RULES.tsx
RULES.jsx = RULES.tsx

interface Span {
  start: number
  end: number
  cls: string
}

export function highlight(code: string, lang: Lang = 'tsx'): React.ReactNode[] {
  const rules = RULES[lang] ?? []
  if (rules.length === 0) return [code]

  const spans: Span[] = []
  const taken = new Uint8Array(code.length)

  for (const rule of rules) {
    rule.re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = rule.re.exec(code)) !== null) {
      if (m[0].length === 0) {
        rule.re.lastIndex++
        continue
      }
      const start = m.index
      const end = start + m[0].length
      // Earlier rules win — a keyword inside a string stays a string.
      let free = true
      for (let i = start; i < end; i++) {
        if (taken[i]) {
          free = false
          break
        }
      }
      if (!free) continue
      for (let i = start; i < end; i++) taken[i] = 1
      spans.push({ start, end, cls: rule.cls })
    }
  }

  spans.sort((a, b) => a.start - b.start)

  const out: React.ReactNode[] = []
  let cursor = 0
  spans.forEach((s, i) => {
    if (s.start > cursor) out.push(code.slice(cursor, s.start))
    out.push(
      <span key={`${s.start}-${i}`} className={s.cls}>
        {code.slice(s.start, s.end)}
      </span>,
    )
    cursor = s.end
  })
  if (cursor < code.length) out.push(code.slice(cursor))
  return out
}
