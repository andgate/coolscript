import * as nearley from 'nearley'
// @ts-ignore
import grammar from '../grammar.ne'
import { Term } from '@coolscript/syntax'

export function parse(src: string): Term | null {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
  try {
    parser.feed(src)
  } catch (e) {
    console.error(e)
    return null
  }
  return parser.results[0]
}
