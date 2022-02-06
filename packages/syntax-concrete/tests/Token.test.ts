import { Token, SourceToken } from '@coolscript/syntax-concrete'
import * as fc from 'fast-check'

test('2 + 3 = 5', () => {
  expect(2 + 3).toBe(5)
})

test('3 * 4 = 12', () => {
  expect(3 * 4).toBe(12)
})

test('5 - 6 = -1', () => {
  expect(5 - 6).toBe(-1)
})

test('8 / 4 = 2', () => {
  expect(8 / 4).toBe(2)
})
