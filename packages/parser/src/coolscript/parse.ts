import * as nearley from 'nearley'
import { Term } from '@coolscript/syntax'
import { coolscriptGrammar } from './grammar'

export function parse(src: string): Term | Error {
  const parser = new nearley.Parser(coolscriptGrammar)
  try {
    parser.feed(src)
  } catch (e) {
    return Error(`Parse error: ${e.message}`)
  }
  return parser.results[0]
}
