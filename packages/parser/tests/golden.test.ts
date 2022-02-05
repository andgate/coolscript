import { examples } from '@coolscript/examples'
import { parse } from '@coolscript/parser'

test('Example 1', () => {
  const parseResult = parse(examples[0])
  const resultJSON = JSON.stringify(parseResult)
  expect(resultJSON).toMatchSnapshot()
})
