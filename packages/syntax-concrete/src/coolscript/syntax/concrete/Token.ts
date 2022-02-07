import { Span, Merge, TextSpan } from './Span'

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
  const line = source.line
  const col = source.col
  return {
    type: 'Token',
    text,
    span: TextSpan(text, line, col)
  }
}

export function Token(
  firstSource: SourceToken,
  ...otherSources: SourceToken[]
): Token {
  const token = SourceToken(firstSource)
  const n = otherSources.length
  if (n <= 0) {
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
