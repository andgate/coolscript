import { Span, Merge } from '@coolscript/syntax-concrete'
import * as fc from 'fast-check'

describe('Span', () => {
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
})
