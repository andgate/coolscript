import { Syntax } from './syntax'

export function parse(_src: string): Syntax {
  return { tag: 'Expr' }
}