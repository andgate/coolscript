import { Term } from '@coolscript/syntax'
import { float, string, whitespace } from 'parjs'
import { between, manySepBy } from 'parjs/combinators'

export function parse(src: string): Term {
  return { tag: 'TmValue', value: { tag: 'VString', str: src } }
}
