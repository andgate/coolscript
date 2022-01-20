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
  TmFor
} from '@coolscript/syntax'
import { StringBuilder } from './StringBuilder'

export function generateJS(tm: Term): string {
  const builder = new StringBuilder()
  buildTermJS(tm, builder)
  return builder.toString()
}

function buildTermJS(tm: Term, builder: StringBuilder) {
  switch (tm.tag) {
    case 'TmError':
      buildTmErrorJS(tm, builder)
      return
    case 'TmValue':
      buildTmValueJS(tm, builder)
      return
    case 'TmVar':
      buildTmVarJS(tm, builder)
      return
    case 'TmAssign':
      buildTmAssign(tm, builder)
      return
    case 'TmLam':
      buildTmLam(tm, builder)
      return
    case 'TmReturn':
      buildTmReturn(tm, builder)
      return
    case 'TmCall':
      buildTmCall(tm, builder)
      return
    case 'TmParens':
      buildTmParens(tm, builder)
      return
    case 'TmArray':
      buildTmArray(tm, builder)
      return
    case 'TmObject':
      buildTmObject(tm, builder)
      return
    case 'TmLet':
      buildTmLet(tm, builder)
      return
    case 'TmDo':
      buildTmDo(tm, builder)
      return
    case 'TmIf':
      buildTmIf(tm, builder)
      return
    case 'TmWhile':
      buildTmWhile(tm, builder)
      return
    case 'TmFor':
      buildTmFor(tm, builder)
      return
    default:
      console.error('Unknown term tag encountered.', tm)
      return
  }
}

function buildTmErrorJS(tm: TmError, builder: StringBuilder) {
  builder.append(`throw new Error(${tm.msg});`)
}

function buildTmValueJS(tm: TmValue, builder: StringBuilder) {
  buildAValueJS(tm.value, builder)
}

function buildAValueJS(v: AValue, builder: StringBuilder) {
  switch (v.tag) {
    case 'VNull':
      builder.append('null')
      break
    case 'VNumber':
      builder.append(v.num.toString())
      break
    case 'VString':
      builder.append(`'${v.str}'`)
      break
    case 'VBool':
      builder.append(v.bool.toString())
      break
    default:
      console.error('Unknown value tag encountered.', v)
      break
  }
}

function buildTmVarJS(tm: TmVar, builder: StringBuilder) {
  builder.append(tm.variable)
}

function buildTmAssign(tm: TmAssign, builder: StringBuilder) {
  builder.append(`${tm.lhs} = `)
  buildTermJS(tm.rhs, builder)
  builder.append(';')
}

function buildTmLam(tm: TmLam, builder: StringBuilder) {}

function buildTmReturn(tm: TmReturn, builder: StringBuilder) {}

function buildTmCall(tm: TmCall, builder: StringBuilder) {}

function buildTmParens(tm: TmParens, builder: StringBuilder) {}

function buildTmArray(tm: TmArray, builder: StringBuilder) {}

function buildTmObject(tm: TmObject, builder: StringBuilder) {}

function buildTmLet(tm: TmLet, builder: StringBuilder) {}

function buildTmDo(tm: TmDo, builder: StringBuilder) {}

function buildTmIf(tm: TmIf, builder: StringBuilder) {}

function buildTmWhile(tm: TmWhile, builder: StringBuilder) {}

function buildTmFor(tm: TmFor, builder: StringBuilder) {}
