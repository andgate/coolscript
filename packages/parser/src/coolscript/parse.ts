import { Syntax } from '@coolscript/syntax'

export function parse(src: string): Syntax {
  return { tag: src }
}
