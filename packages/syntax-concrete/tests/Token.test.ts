import * as fc from 'fast-check'
import { Token, SourceToken } from '@coolscript/syntax-concrete'

const arbMultiLineString = (): fc.Arbitrary<string> =>
  fc
    .array(fc.string(), { minLength: 2, maxLength: 10 })
    .map((a) => a.join('\n'))

const ArbitrarySourceToken = (): fc.Arbitrary<SourceToken> =>
  fc.tuple(fc.string(), fc.nat(), fc.nat()).map(([text, line, col]) => ({
    text,
    line,
    col
  }))

const MultiLineSourceToken = (): fc.Arbitrary<SourceToken> =>
  fc
    .tuple(arbMultiLineString(), fc.nat(), fc.nat())
    .map(([text, line, col]) => ({
      text,
      line,
      col
    }))

const containsNewline = (s: string): boolean => s.indexOf('\n') >= 0

test('!containsNewline(fc.string())', () => {
  fc.assert(
    fc.property(fc.string(), (s) => {
      return !containsNewline(s)
    })
  )
})

test('containsNewline(arbMultiLineString())', () => {
  fc.assert(
    fc.property(arbMultiLineString(), (s) => {
      return containsNewline(s)
    })
  )
})

test('SourceToken(t).text == t.text', () => {
  fc.assert(
    fc.property(ArbitrarySourceToken(), (t) => {
      return SourceToken(t).text == t.text
    })
  )
})

test('SourceToken(t).span.line.start == t.line', () => {
  fc.assert(
    fc.property(ArbitrarySourceToken(), (t) => {
      return SourceToken(t).span.line.start == t.line
    })
  )
})

test('SourceToken(t).span.line.end == t.line', () => {
  fc.assert(
    fc.property(ArbitrarySourceToken(), (t) => {
      return SourceToken(t).span.line.end == t.line
    })
  )
})

test('SourceToken(t).span.column.start == t.col', () => {
  fc.assert(
    fc.property(ArbitrarySourceToken(), (t) => {
      return SourceToken(t).span.column.start == t.col
    })
  )
})

test('SourceToken({text: " ", line: 0, col: 0}).span.column.end == 1', () => {
  const t: SourceToken = { text: ' ', line: 0, col: 0 }
  expect(SourceToken(t).span.column.end).toBe(1)
})

test('SourceToken(t).span.column.end == t.col + t.text.length', () => {
  fc.assert(
    fc.property(ArbitrarySourceToken(), (t) => {
      const expectedColumnEnd = t.col + t.text.length
      return SourceToken(t).span.column.end == expectedColumnEnd
    })
  )
})

test('Token(t) == SourceToken(t)', () => {
  fc.assert(
    fc.property(ArbitrarySourceToken(), (t) => {
      return JSON.stringify(Token(t)) == JSON.stringify(SourceToken(t))
    })
  )
})

test('Token(t1, ...tn).text == [t1.text, ...tn.text].join("")', () => {
  fc.assert(
    fc.property(
      ArbitrarySourceToken(),
      fc.array(ArbitrarySourceToken(), { minLength: 0, maxLength: 10 }),
      (token, tokens) => {
        const expectedText = [token, ...tokens].map((t) => t.text).join('')
        return Token(token, ...tokens).text == expectedText
      }
    )
  )
})
