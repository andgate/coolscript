import {
  Term,
  TmWhile,
  TmFor,
  TmAssign,
  TmError,
  TmLam,
  TmValue,
  TmReturn,
  TmVar,
  TmCall,
  TmParens,
  TmArray,
  TmObject,
  Binding,
  TmLet,
  TermBlock,
  TmDo,
  Branch,
  TmIf,
  ElifBranch,
  ElseBranch,
  Value
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
    case 'TmReturn':
      return TmReturn(tm.result, ann)
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
      const block = scopeBlock(tm.block, childScope)
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
  const oldBody = tm.body
  let body: Term | TermBlock
  if (oldBody.tag == 'TmBlock') {
    body = scopeBlock(oldBody, childScope)
  } else {
    body = scopeTerm(oldBody, childScope)
  }
  return TmLet(binders, body, ann)
}

function scopeBlock(block: TermBlock, scope: Scope): TermBlock {
  const statements = block.statements.map((t) => scopeTerm(t, scope))
  return TermBlock(statements)
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
