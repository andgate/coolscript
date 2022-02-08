import { examples } from '@coolscript/examples'
import { evaluate } from '@coolscript/eval'

const exampleKeys: string[] = Object.keys(examples)

describe('CoolScript Standard Evaluator Golden Test Suite', () => {
  test.each(exampleKeys)('Evaluating example %p', (exampleKey) => {
    const example = examples[exampleKey]
    const parseResult = evaluate(example)
    expect(parseResult).toMatchSnapshot(exampleKey)
  })
})
