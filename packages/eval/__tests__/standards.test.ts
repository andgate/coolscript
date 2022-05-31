import { examples } from '@coolscript/examples'
import { evalCS, EvalResult } from '@coolscript/eval'

const exampleKeys: string[] = Object.keys(examples)

describe('CoolScript Evaluator Standards Test Suite', () => {
  describe('Javacript Evaluator', () => {
    test.each(exampleKeys)('Example %p', (exampleKey) => {
      const example = examples[exampleKey]
      let standardResult: EvalResult
      let jsResult: EvalResult
      try {
        standardResult = evalCS(example, { backend: 'standard' })
        jsResult = evalCS(example, { backend: 'js' })
      } catch (e) {
        console.log(`Testing failed at ${exampleKey}`, e)
      }
      expect(JSON.stringify(jsResult)).toBe(JSON.stringify(standardResult))
    })
  })
})
