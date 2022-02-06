import { Span, Merge } from '@coolscript/syntax-concrete'
import * as fc from 'fast-check'

describe('Span', () => {
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
})
