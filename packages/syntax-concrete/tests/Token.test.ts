import { Token, SourceToken } from '@coolscript/syntax-concrete'
import * as fc from 'fast-check'

const ArbitrarySourceToken = (): fc.Arbitrary<SourceToken> =>
  fc.tuple(fc.string(), fc.nat(), fc.nat()).map(([text, line, col]) => ({
    text,
    line,
    col
  }))

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

test('SourceToken(t).span.column.start == t.col', () => {
  fc.assert(
    fc.property(ArbitrarySourceToken(), (t) => {
      return SourceToken(t).span.column.start == t.col
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
