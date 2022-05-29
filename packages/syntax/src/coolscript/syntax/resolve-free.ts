import { isStatement, isTerm } from './common'
import { Statement, Term, Variable } from './types'

export function resolveFree(termOrStatement: Term | Statement): Variable[] {
  const scope = emptyScope()
  if (isTerm(termOrStatement)) {
    return resolveFreeTerm(termOrStatement as Term, scope)
  }

  if (isStatement(termOrStatement)) {
    return resolveFreeStatement(termOrStatement as Statement, scope)
  }

  return []
}

interface Scope {
  bound: Set<Variable>[]
}

function emptyScope(): Scope {
  return { bound: [new Set()] }
}

export function resolveFreeTerm(term: Term, scope: Scope) {
  return []
}

export function resolveFreeStatement(statement: Statement, scope: Scope) {
  return []
}
