import { examples } from '@coolscript/examples'
import { evalCS } from '@coolscript/eval'

const exampleKeys: string[] = Object.keys(examples)

describe('CoolScript Evaluator Standards Test Suite', () => {
  describe('Javacript Evaluator', () => {
    test.each(exampleKeys)('Example %p', (exampleKey) => {
      const example = examples[exampleKey]
      const standardResult = evalCS(example, { backend: 'standard' })
      const jsResult = evalCS(example, { backend: 'js' })
      expect(JSON.stringify(jsResult)).toBe(JSON.stringify(standardResult))
    })
  })
})
