import { Statement, Term } from './syntax-types'

export function isTerm(termOrStatement: Term | Statement): boolean {
  return termOrStatement.tag.endsWith('Term')
}

export function isStatement(termOrStatement: Term | Statement): boolean {
  return termOrStatement.tag.endsWith('Statement')
}
