import { examples } from '@coolscript/examples'
import { codegenJS } from '@coolscript/codegen-js'

const exampleKeys: string[] = Object.keys(examples)

describe('CoolScript JS Codegen Golden Test Suite', () => {
  test.each(exampleKeys)('Generating example %p', (exampleKey) => {
    const example = examples[exampleKey]
    const parseResult = codegenJS(example)
    expect(parseResult).toMatchSnapshot(exampleKey)
  })
})
