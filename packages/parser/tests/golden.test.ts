import { examples } from '@coolscript/examples'
import { parse } from '@coolscript/parser'

describe('Parser Golden Test Suite', () => {
  test.each(examples)('Example %#', (example) => {
    const parseResult = parse(example)
    expect(parseResult).toMatchSnapshot()
  })
})
