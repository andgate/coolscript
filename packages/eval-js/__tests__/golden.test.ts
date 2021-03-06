import { examples } from '@coolscript/examples'
import { evalCS } from '@coolscript/eval-js'

const exampleKeys: string[] = Object.keys(examples)

describe('CoolScript JS Evaluator Golden Test Suite', () => {
  test.each(exampleKeys)('Evaluating example %p', (exampleKey) => {
    const example = examples[exampleKey]
    const result = evalCS(example)
    expect(result).toMatchSnapshot(exampleKey)
  })
})
