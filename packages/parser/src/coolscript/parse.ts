import * as nearley from 'nearley'
import { Term } from '@coolscript/syntax'
import { coolscriptGrammar } from './grammar'

export function parse(src: string): Term | null {
  const parser = new nearley.Parser(coolscriptGrammar)
  try {
    parser.feed(src)
  } catch (e) {
    console.error(e)
    return null
  }
  return parser.results[0]
}
