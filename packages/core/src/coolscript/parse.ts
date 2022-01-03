import { Syntax } from './syntax'

export function parse(src: string): Syntax {
  return { tag: src }
}
