import type {
  Term,
  TmValue,
  AValue,
  TmError,
  TmVar,
  TmLam,
  TmAssign,
  TmReturn,
  TmCall,
  TmParens,
  TmArray,
  TmObject,
  TmLet,
  TmDo,
  TmIf,
  TmWhile,
  TmFor,
  TermBlock
} from '@coolscript/syntax'
import * as astring from 'astring'
import type * as ES from 'estree'
import * as e from '../../../estree/constructors'

export function generateJS(tm: Term): string {
  const main = e.Function('main', [], [fromRootTerm(tm)])
  const callMain = e.FunctionCallStatement('main', [])
  const estree: ES.Program = e.Program([main, callMain] as ES.Statement[])
  return astring.generate(estree)
}

function fromRootTerm(tm: Term): ES.ExpressionStatement {
  return e.ExpressionStatement(fromTerm(tm))
}

function fromTerm(tm: Term): ES.Expression {
  switch (tm.tag) {
    case 'TmError':
      return fromTmError(tm)
    case 'TmValue':
      return fromTmValue(tm)
    case 'TmVar':
      return fromTmVar(tm)
    case 'TmAssign':
      return fromTmAssign(tm)
    case 'TmLam':
      return fromTmLam(tm)
    case 'TmReturn':
      return fromTmReturn(tm)
    case 'TmCall':
      return fromTmCall(tm)
    case 'TmParens':
      return fromTmParens(tm)
    case 'TmArray':
      return fromTmArray(tm)
    case 'TmObject':
      return fromTmObject(tm)
    case 'TmLet':
      return fromTmLet(tm)
    case 'TmDo':
      return fromTmDo(tm)
    case 'TmIf':
      return fromTmIf(tm)
    case 'TmWhile':
      return fromTmWhile(tm)
    case 'TmFor':
      return fromTmFor(tm)
    default:
      console.error('Unknown term tag encountered.', tm)
      return e.Null()
  }
}

function fromTmError(tm: TmError): ES.Expression {
  return e.ClosureExpression([e.ThrowError(tm.msg)])
}

function fromTmValue(tm: TmValue): ES.Literal {
  return fromAValue(tm.value)
}

function fromAValue(v: AValue): ES.Literal {
  switch (v.tag) {
    case 'VNull':
      return e.Null()
    case 'VNumber':
      return e.Number(v.num)
    case 'VString':
      return e.Str(v.str)
    case 'VBool':
      return e.Bool(v.bool)
    default:
      throw new Error(`Unknown value tag encountered in: ${v}`)
  }
}

function fromTmVar(tm: TmVar): ES.Expression {
  return e.Id(tm.variable)
}

function fromTmAssign(tm: TmAssign): ES.Expression {
  return e.Assign(tm.lhs, fromTerm(tm.rhs))
}

function fromTmLam(tm: TmLam): ES.Expression {
  const args = tm.args.map((arg) => e.Id(arg))
  const body = [e.ExpressionStatement(fromTerm(tm.body))]
  return e.LambdaExpression(args, body)
}

function fromTmReturn(tm: TmReturn): ES.Expression {
  return e.ClosureExpression([e.ReturnStatement(fromTerm(tm.result))])
}

function fromTmCall(tm: TmCall): ES.Expression {
  const f = fromTerm(tm.caller)
  const args = tm.args.map((arg) => fromTerm(arg))
  return e.CallExpression(f, args)
}

function fromTmParens(tm: TmParens): ES.Expression {
  return fromTerm(tm.term)
}

function fromTmArray(tm: TmArray): ES.Expression {
  const elements = tm.elements.map((e) => fromTerm(e))
  return e.ArrayExpression(elements)
}

function fromTmObject(tm: TmObject): ES.Expression {
  const properties: ES.Property[] = Object.entries(tm.obj).map(
    ([name, val]) => ({
      type: 'Property',
      key: {
        type: 'Identifier',
        name
      },
      value: fromTerm(val) as ES.Expression,
      kind: 'init',
      method: false,
      shorthand: false,
      computed: false
    })
  )
  return {
    type: 'ObjectExpression',
    properties
  }
}

function fromTmLet(tm: TmLet): ES.Expression {
  const binders = tm.binders
  const body = tm.body
  const defs = binders.map((b) => e.Const(b.variable, fromTerm(b.body)))
  const esbody = body.tag == 'TmBlock' ? fromTermBlock(body) : fromTerm(body)
  return e.ClosureExpression([...defs, e.ReturnStatement(esbody)])
}

function fromTermBlock(block: TermBlock): ES.Expression {
  const body = block.statements.map((s) => e.ExpressionStatement(fromTerm(s)))
  return e.ClosureExpression([e.BlockStatement(body)])
}

function fromTmDo(tm: TmDo): ES.Expression {
  return fromTermBlock(tm.block)
}

function fromTmIf(tm: TmIf): ES.Expression {
  return e.Null()
}

function fromTmWhile(tm: TmWhile): ES.Expression {
  return e.Null()
}

function fromTmFor(tm: TmFor): ES.Expression {
  return e.Null()
}
