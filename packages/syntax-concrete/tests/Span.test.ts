import { Span, Merge } from '@coolscript/syntax-concrete'
import * as fc from 'fast-check'

const aSpan = (): fc.Arbitrary<Span> =>
  fc
    .tuple(fc.nat(), fc.nat(), fc.nat(), fc.nat())
    .map(([n1, n2, n3, n4]) => Span(n1, n1 + n2, n3, n3 + n4))

test('Span(1, 2, 3, 4).type == "Span"', () => {
  expect(Span(1, 2, 3, 4).type).toBe('Span')
})

test('Span(1, 2, 3, 4).line.start == 1', () => {
  expect(Span(1, 2, 3, 4).line.start).toBe(1)
})

test('Span(1, 2, 3, 4).line.end == 2', () => {
  expect(Span(1, 2, 3, 4).line.end).toBe(2)
})

test('Span(1, 2, 3, 4).column.start == 3', () => {
  expect(Span(1, 2, 3, 4).column.start).toBe(3)
})

test('Span(1, 2, 3, 4).column.end == 4', () => {
  expect(Span(1, 2, 3, 4).column.end).toBe(4)
})

test('Span(x1, x2, x3, x4).type == "Span"', () => {
  fc.assert(
    fc.property(fc.nat(), fc.nat(), fc.nat(), fc.nat(), (x1, x2, x3, x4) => {
      return Span(x1, x2, x3, x4).type == 'Span'
    })
  )
})

test('Span(x1, x2, x3, x4).type == "Span"', () => {
  fc.assert(
    fc.property(fc.nat(), fc.nat(), fc.nat(), fc.nat(), (x1, x2, x3, x4) => {
      return Span(x1, x2, x3, x4).type == 'Span'
    })
  )
})

test('Span(x1, x2, x3, x4).line.start == x1', () => {
  fc.assert(
    fc.property(fc.nat(), fc.nat(), fc.nat(), fc.nat(), (x1, x2, x3, x4) => {
      return Span(x1, x2, x3, x4).line.start == x1
    })
  )
})

test('Span(x1, x2, x3, x4).line.end == x2', () => {
  fc.assert(
    fc.property(fc.nat(), fc.nat(), fc.nat(), fc.nat(), (x1, x2, x3, x4) => {
      return Span(x1, x2, x3, x4).line.end == x2
    })
  )
})

test('Span(x1, x2, x3, x4).column.start == x3', () => {
  fc.assert(
    fc.property(fc.nat(), fc.nat(), fc.nat(), fc.nat(), (x1, x2, x3, x4) => {
      return Span(x1, x2, x3, x4).column.start == x3
    })
  )
})

test('Span(x1, x2, x3, x4).column.end == x4', () => {
  fc.assert(
    fc.property(fc.nat(), fc.nat(), fc.nat(), fc.nat(), (x1, x2, x3, x4) => {
      return Span(x1, x2, x3, x4).column.end == x4
    })
  )
})

test('Merge(Span(0, 0, 0, 0), Span(0, 0, 0, 0)) == Span(0, 0, 0, 0)', () => {
  const s1 = Span(0, 0, 0, 0)
  const s2 = Span(0, 0, 0, 0)
  const s3 = Span(0, 0, 0, 0)
  expect(Merge(s1, s2)).toStrictEqual(s3)
})

test('Merge(Span(1, 2, 3, 4), Span(5, 6, 7, 8)) == Span(1, 6, 3, 8)', () => {
  const s1 = Span(1, 2, 3, 4)
  const s2 = Span(5, 6, 7, 8)
  const s3 = Span(1, 6, 3, 8)
  expect(Merge(s1, s2)).toStrictEqual(s3)
})

test('Merge(s, s) == s', () => {
  fc.assert(
    fc.property(aSpan(), (s) => {
      return JSON.stringify(Merge(s, s)) == JSON.stringify(s)
    })
  )
})
