import { Span, Merge } from './Span'

export type Token = {
  type: 'Token'
  text: string
  span: Span
}

export type SourceToken = {
  text: string
  line: number
  col: number
}

export function SourceToken(source: SourceToken): Token {
  const text = source.text
  if (text.length == 0) {
    const l = source.line
    const c = source.col
    return {
      type: 'Token',
      text: '',
      span: Span(l, l, c, c)
    }
  }

  const n = text.length - 1
  const lineStart = source.line
  const columnStart = source.col

  let lineEnd = lineStart
  let columnEnd = columnStart
  for (let i = 0; i < n; i++) {
    if (text.charAt(i) == '\n') {
      columnEnd = 1
      ++lineEnd
      continue
    }
    ++columnEnd
  }

  return {
    type: 'Token',
    text: source.text,
    span: Span(lineStart, lineEnd, columnStart, columnEnd)
  }
}

export function Token(
  firstSource: SourceToken,
  ...otherSources: SourceToken[]
): Token {
  const token = SourceToken(firstSource)
  const n = otherSources.length
  if (otherSources && otherSources.length <= 0) {
    return token
  }

  // Join token text
  token.text += otherSources.map((s) => s.text).join('')

  // Merge the first and last spans
  const lastSource = otherSources[n - 1]
  const lastToken = SourceToken(lastSource)
  const span = Merge(token.span, lastToken.span)
  token.span = span

  return token
}
