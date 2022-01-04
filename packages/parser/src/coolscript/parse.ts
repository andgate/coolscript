import { Syntax } from '@coolscript/syntax'
import { float, string, whitespace } from 'parjs'
import { between, manySepBy } from 'parjs/combinators'

export function parse(src: string): Syntax {
  return { tag: src }
}
