import * as fc from 'fast-check'
import { Token, SourceToken, lines } from '@coolscript/syntax-concrete'

const arbMultiLineString = (): fc.Arbitrary<string> =>
  fc
    .array(fc.string(), { minLength: 2, maxLength: 10 })
    .map((a) => a.join('\n'))

const arbSourceString = (multiline?: boolean): fc.Arbitrary<string> =>
  multiline ? arbMultiLineString() : fc.string()

const ArbitrarySourceToken = (multiline?: boolean): fc.Arbitrary<SourceToken> =>
  fc
    .tuple(arbSourceString(multiline), fc.nat(), fc.nat())
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

test('Token(t1, t2).text == SourceToken(t1).text + SourceToken(t2).text', () => {
  fc.assert(
    fc.property(ArbitrarySourceToken(), ArbitrarySourceToken(), (t1, t2) => {
      const text1 = Token(t1, t2).text
      const text2 = SourceToken(t1).text + SourceToken(t2).text
      return text1 == text2
    })
  )
})

test('Token(t1, t2, t3).text == SourceToken(t1).text + SourceToken(t2).text + SourceToken(t3).text', () => {
  fc.assert(
    fc.property(
      ArbitrarySourceToken(),
      ArbitrarySourceToken(),
      ArbitrarySourceToken(),
      (t1, t2, t3) => {
        const text1 = Token(t1, t2, t3).text
        const text2 =
          SourceToken(t1).text + SourceToken(t2).text + SourceToken(t3).text
        return text1 == text2
      }
    )
  )
})

test('Token(t1, t2, t3).span.line.start == SourceToken(t1).span.line.start', () => {
  fc.assert(
    fc.property(
      ArbitrarySourceToken(),
      ArbitrarySourceToken(),
      ArbitrarySourceToken(),
      (t1, t2, t3) => {
        const n1 = Token(t1, t2, t3).span.line.start
        const n2 = SourceToken(t1).span.line.start
        return n1 == n2
      }
    )
  )
})

test('Token(t1, t2, t3).span.column.start == SourceToken(t1).span.column.start', () => {
  fc.assert(
    fc.property(
      ArbitrarySourceToken(),
      ArbitrarySourceToken(),
      ArbitrarySourceToken(),
      (t1, t2, t3) => {
        const n1 = Token(t1, t2, t3).span.column.start
        const n2 = SourceToken(t1).span.column.start
        return n1 == n2
      }
    )
  )
})

test('Token(t1, t2, t3).span.line.end == SourceToken(t3).span.line.end', () => {
  fc.assert(
    fc.property(
      ArbitrarySourceToken(),
      ArbitrarySourceToken(),
      ArbitrarySourceToken(),
      (t1, t2, t3) => {
        const n1 = Token(t1, t2, t3).span.line.end
        const n2 = SourceToken(t3).span.line.end
        return n1 == n2
      }
    )
  )
})

test('lines("") == [""]', () => {
  expect(lines('')).toEqual([''])
})

test('lines("\n") == ["", ""]', () => {
  expect(lines('\n')).toEqual(['', ''])
})

test('lines("a") == ["a"]', () => {
  expect(lines('a')).toEqual(['a'])
})

test('lines("a\n") == ["a", ""]', () => {
  expect(lines('a\n')).toEqual(['a', ''])
})

test('lines("a\nb\nc").length == 3', () => {
  expect(lines('a\nb\nc').length).toBe(3)
})

test('lines("a\nb\nc") == ["a", "b", "c"]', () => {
  expect(lines('a\nb\nc')).toEqual(['a', 'b', 'c'])
})

test('lines("a\nb\nc").length == 3', () => {
  expect(lines('a\nb\nc').length).toBe(3)
})

test('SourceToken(t).span.line.end == t.line + lineCount(t.text)', () => {
  fc.assert(
    fc.property(ArbitrarySourceToken(true), (t) => {
      const n1 = SourceToken(t).span.line.end
      const n2 = t.line + lines(t.text).length - 1
      return n1 == n2
    })
  )
})

test('Token(t).span.line.end == t.line + lines(t.text).length - 1', () => {
  fc.assert(
    fc.property(ArbitrarySourceToken(true), (t) => {
      const n1 = Token(t).span.line.end
      const n2 = t.line + lines(t.text).length - 1
      return n1 == n2
    })
  )
})

test('Token(t).span.column.end == t.col + lines[lines.length - 1].length - 1', () => {
  fc.assert(
    fc.property(ArbitrarySourceToken(true), (t) => {
      const ls = lines(t.text)
      const n1 = Token(t).span.column.end
      const n2 = t.col + ls[ls.length - 1].length
      return n1 == n2
    })
  )
})

test('Token(t1, t2, t3).span.column.end == SourceToken(t3).span.column.end', () => {
  fc.assert(
    fc.property(
      ArbitrarySourceToken(),
      ArbitrarySourceToken(),
      ArbitrarySourceToken(),
      (t1, t2, t3) => {
        const n1 = Token(t1, t2, t3).span.column.end
        const n2 = SourceToken(t3).span.column.end
        return n1 == n2
      }
    )
  )
})
