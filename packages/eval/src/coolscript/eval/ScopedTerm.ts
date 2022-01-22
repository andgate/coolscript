import {
  Term,
  TmWhile,
  TmFor,
  TmAssign,
  TmError,
  TmLam,
  TmValue,
  TmVar,
  TmCall,
  TmParens,
  TmArray,
  TmObject,
  Binding,
  TmLet,
  TmDo,
  Branch,
  TmIf,
  ElifBranch,
  ElseBranch,
  Statement,
  AssignmentStatement,
  CallStatement,
  ReturnStatement,
  BlockStatement
} from '@coolscript/syntax'
import { Scope } from './Scope'
import { SymbolCS } from './SymbolCS'

export type ScopeAnn = { scope: Scope }

export function scopeTerm(tm: Term, scope: Scope): Term {
  const ann = { scope }
  switch (tm.tag) {
    case 'TmError':
      return TmError(tm.msg, ann)
    case 'TmValue':
      return TmValue(tm.value, ann)
    case 'TmVar':
      return TmVar(tm.variable, ann)
    case 'TmAssign': {
      const sym: SymbolCS = SymbolCS(tm.lhs, scope)
      scope.define(sym)
      const rhs = scopeTerm(tm.rhs, scope)
      return TmAssign(tm.lhs, rhs, ann)
    }
    case 'TmLam': {
      const childScope = new Scope(scope)
      ann.scope = childScope
      tm.args.forEach((v) => ann.scope.define(SymbolCS(v, childScope)))
      const body = scopeTerm(tm.body, childScope)
      return TmLam(tm.args, body, ann)
    }
    case 'TmCall': {
      const caller = scopeTerm(tm.caller, scope)
      const args = tm.args.map((arg) => scopeTerm(arg, scope))
      return TmCall(caller, args, ann)
    }
    case 'TmParens': {
      return TmParens(scopeTerm(tm, scope), ann)
    }
    case 'TmArray': {
      const elements = tm.elements.map((e) => scopeTerm(e, scope))
      return TmArray(elements, ann)
    }
    case 'TmObject': {
      const entries = Object.entries(tm.obj).map(([n, t]) => [
        n,
        scopeTerm(t, scope)
      ])
      const obj = Object.fromEntries(entries)
      return TmObject(obj, ann)
    }
    case 'TmLet':
      return scopeTmLet(tm, scope)
    case 'TmDo': {
      const childScope = new Scope(scope)
      ann.scope = childScope
      const block = scopeBlockStatement(tm.block, childScope)
      return TmDo(block, ann)
    }
    case 'TmIf': {
      const pred = scopeTerm(tm.pred, scope)
      const body = scopeTerm(tm.body, scope)
      const branch = scopeBranch(tm.branch, scope)
      return TmIf(pred, body, branch, ann)
    }
    case 'TmWhile': {
      const pred = scopeTerm(tm.pred, scope)
      const body = scopeTerm(tm.body, new Scope(scope))
      return TmWhile(pred, body, ann)
    }
    case 'TmFor': {
      const childScope = new Scope(scope)
      ann.scope = childScope
      const init = scopeTerm(tm.init, childScope)
      const pred = scopeTerm(tm.pred, childScope)
      const iter = scopeTerm(tm.iter, childScope)
      const body = scopeTerm(tm.body, childScope)
      return TmFor(init, pred, iter, body, ann)
    }
    default: {
      throw Error(
        `scopedTerm: Unrecognized term tag encountered: ${JSON.stringify(tm)}`
      )
    }
  }
}

function scopeTmLet(tm: TmLet, scope: Scope): TmLet {
  const childScope = new Scope(scope)
  const ann = { scope: childScope }
  tm.binders.map((b) => childScope.define(SymbolCS(b.variable, childScope)))
  const binders = tm.binders.map((b) =>
    Binding(b.variable, scopeTerm(b.body, childScope))
  )
  const body = scopeTerm(tm.body, childScope)
  return TmLet(binders, body, ann)
}

function scopeBranch(br: Branch, scope: Scope): Branch {
  switch (br.tag) {
    case 'Elif':
      return scopeElifBranch(br, scope)
    case 'Else':
      return scopeElseBranch(br, scope)
  }
}

function scopeElifBranch(br: ElifBranch, scope: Scope): Branch {
  const pred = scopeTerm(br.pred, scope)
  const body = scopeTerm(br.body, scope)
  let branch: Branch | null = null
  if (br.branch) {
    branch = scopeBranch(br.branch, scope)
  }
  return ElifBranch(pred, body, branch)
}

function scopeElseBranch(br: ElseBranch, scope: Scope): Branch {
  const body = scopeTerm(br.body, scope)
  return ElseBranch(body)
}

function scopeStatement(s: Statement, scope: Scope): Statement {
  switch (s.tag) {
    case 'AssignmentStatement': {
      return scopeAssignmentStatement(s, scope)
    }
    case 'CallStatement': {
      return scopeCallStatement(s, scope)
    }
    case 'ReturnStatement': {
      return scopeReturnStatement(s, scope)
    }
    case 'BlockStatement': {
      return scopeBlockStatement(s, scope)
    }
    default:
      throw new Error(
        `scopeStatement: Unrecognized statement tag ${JSON.stringify(s)}`
      )
  }
}

function scopeAssignmentStatement(
  s: AssignmentStatement,
  scope: Scope
): AssignmentStatement {
  const lhs = s.lhs
  if (!scope.resolve(lhs)) {
    scope.define(SymbolCS(lhs, scope))
  }
  const rhs = scopeTerm(s.rhs, scope)
  return AssignmentStatement(lhs, rhs, { scope })
}

function scopeCallStatement(s: CallStatement, scope: Scope): CallStatement {
  const fn = scopeTerm(s.fn, scope)
  const args = s.args.map((arg) => scopeTerm(arg, scope))
  return CallStatement(fn, args, { scope })
}

function scopeReturnStatement(
  s: ReturnStatement,
  scope: Scope
): ReturnStatement {
  const result = scopeTerm(s.result, scope)
  return ReturnStatement(result, { scope })
}

function scopeBlockStatement(s: BlockStatement, scope: Scope): BlockStatement {
  const childScope = new Scope(scope)
  const ann = { scope: childScope }
  const statements = s.statements.map((stmt) =>
    scopeStatement(stmt, childScope)
  )
  return BlockStatement(statements, ann)
}
