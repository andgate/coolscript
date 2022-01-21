import {
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
import * as ES from 'estree'
import e from 'estree-builder'

export function generateJS(tm: Term): string {
  const main = e('function', [], fromTerm(tm), 'main')
  const callMain = e(';', e('call', e('id', 'main'), []))
  const estree: ES.Program = {
    type: 'Program',
    sourceType: 'script',
    body: [main, callMain] as ES.Statement[]
  }
  return astring.generate(estree)
}

function fromTerm(tm: Term): ES.Node {
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
      return e('null')
  }
}

function fromTmError(tm: TmError): ES.Node {
  return e.throw(e.new('Error', e.str(tm.msg)))
}

function fromTmValue(tm: TmValue): ES.Node {
  return fromAValue(tm.value)
}

function fromAValue(v: AValue): ES.Node {
  switch (v.tag) {
    case 'VNull':
      return e('null')
    case 'VNumber':
      return e('number', v.num)
    case 'VString':
      return e('string', v.str)
    case 'VBool':
      return e(v.bool.toString())
    default:
      console.error('Unknown value tag encountered.', v)
      return e('null')
  }
}

function fromTmVar(tm: TmVar): ES.Node {
  return e('id', tm.variable)
}

function fromTmAssign(tm: TmAssign): ES.Node {
  return e.assign(e('id', tm.lhs), fromTerm(tm.rhs))
}

function fromTmLam(tm: TmLam): ES.Node {
  const args = tm.args.map((arg) => e('id', arg))
  const body = fromTerm(tm.body)
  const fn = e('arrow', args, body)
  console.log(tm, fn)
  return {
    type: 'ArrowFunctionExpression',
    params: args as ES.Pattern[],
    body: {
      type: 'BlockStatement',
      body: [e('return', body) as ES.Statement]
    },
    expression: false,
    generator: false
  }
}

function fromTmReturn(tm: TmReturn): ES.Node {
  return e('return', fromTerm(tm.result))
}

function fromTmCall(tm: TmCall): ES.Node {
  const f = fromTerm(tm.caller)
  const args = tm.args.map((arg) => fromTerm(arg))
  return e('call', f, args)
}

function fromTmParens(tm: TmParens): ES.Node {
  return fromTerm(tm.term)
}

function fromTmArray(tm: TmArray): ES.Node {
  const elements = tm.elements.map((e) => fromTerm(e))
  return e('array', elements)
}

function fromTmObject(tm: TmObject): ES.Node {
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

function fromTmLet(tm: TmLet): ES.Node {
  const binders = tm.binders
  const body = tm.body
  const defs: ES.Node[] = binders.map((b) =>
    e('const', b.variable, fromTerm(b.body))
  )
  const esbody = body.tag == 'TmBlock' ? fromTermBlock(body) : fromTerm(body)
  return e.block([...defs, esbody])
}

function fromTermBlock(block: TermBlock): ES.Node {
  const body = block.statements.map((s) => e(';', fromTerm(s)))
  return e('block', body)
}

function fromTmDo(tm: TmDo): ES.Node {
  return fromTermBlock(tm.block)
}

function fromTmIf(tm: TmIf): ES.Node {
  return e('null')
}

function fromTmWhile(tm: TmWhile): ES.Node {
  return e('null')
}

function fromTmFor(tm: TmFor): ES.Node {
  return e('null')
}
