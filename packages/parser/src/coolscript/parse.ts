import * as nearley from 'nearley'
import { Term } from '@coolscript/syntax-concrete'
import { coolscriptGrammar } from './grammar'

export function parse(src: string): Term | null {
  const parser = new nearley.Parser(coolscriptGrammar)
  try {
    parser.feed(src)
  } catch (e) {
    console.error(e)
    return null
  }
  if (parser.results.length > 1) {
    console.error('Ambiguous grammar encountered! Resolving first result.')
    return parser.results[1]
  }
  return parser.results[0]
}
