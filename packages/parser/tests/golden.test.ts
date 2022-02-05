import { examples } from '@coolscript/examples'
import { parse } from '@coolscript/parser'

const exampleKeys: string[] = Object.keys(examples)

describe('Parser Golden Test Suite', () => {
  test.each(exampleKeys)('Parse example %p', (exampleKey) => {
    const example = examples[exampleKey]
    const parseResult = parse(example)
    expect(parseResult).toMatchSnapshot()
  })
})
