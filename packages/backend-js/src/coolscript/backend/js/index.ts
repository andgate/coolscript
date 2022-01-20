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
import { StringBuilder } from './StringBuilder'

export function generateJS(tm: Term): string {
  const builder = new StringBuilder()
  buildTerm(tm, builder)
  return builder.toString()
}

function buildTerm(tm: Term, builder: StringBuilder) {
  switch (tm.tag) {
    case 'TmError':
      buildTmError(tm, builder)
      return
    case 'TmValue':
      buildTmValue(tm, builder)
      return
    case 'TmVar':
      buildTmVar(tm, builder)
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

function buildTmError(tm: TmError, builder: StringBuilder) {
  builder.append(`throw new Error(${tm.msg});`)
}

function buildTmValue(tm: TmValue, builder: StringBuilder) {
  buildAValue(tm.value, builder)
}

function buildAValue(v: AValue, builder: StringBuilder) {
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

function buildTmVar(tm: TmVar, builder: StringBuilder) {
  builder.append(tm.variable)
}

function buildTmAssign(tm: TmAssign, builder: StringBuilder) {
  builder.append(`${tm.lhs} = `)
  buildTerm(tm.rhs, builder)
  builder.append(';')
}

function buildTmLam(tm: TmLam, builder: StringBuilder) {
  builder.append('(')
  for (let i = 0; i < tm.args.length; i++) {
    builder.append(tm.args[i])
    if (i != tm.args.length - 1) {
      builder.append(', ')
    }
  }
  builder.append(') => ')
  buildTerm(tm.body, builder)
}

function buildTmReturn(tm: TmReturn, builder: StringBuilder) {
  builder.append('return ')
  buildTerm(tm.result, builder)
}

function buildTmCall(tm: TmCall, builder: StringBuilder) {
  buildTerm(tm.caller, builder)
  builder.append('(')
  for (let i = 0; i < tm.args.length; i++) {
    buildTerm(tm.args[i], builder)
    if (i != tm.args.length - 1) {
      builder.append(', ')
    }
  }
  builder.append(')')
}

function buildTmParens(tm: TmParens, builder: StringBuilder) {
  builder.append('(')
  buildTerm(tm, builder)
  builder.append(')')
}

function buildTmArray(tm: TmArray, builder: StringBuilder) {
  builder.append('[')
  for (let i = 0; i < tm.elements.length; i++) {
    buildTerm(tm.elements[i], builder)
    if (i != tm.elements.length - 1) {
      builder.append(', ')
    }
  }
  builder.append(']')
}

function buildTmObject(tm: TmObject, builder: StringBuilder) {
  builder.append('{ ')
  const entries = Object.entries(tm.obj)
  for (let i = 0; i < entries.length; i++) {
    builder.append(entries[i][0])
    builder.append(': ')
    buildTerm(entries[i][1], builder)
    if (i != entries.length - 1) {
      builder.append(', ')
    }
  }
  builder.append(' }')
}

function buildTmLet(tm: TmLet, builder: StringBuilder) {
  const binders = tm.binders
  const body = tm.body
  for (let i = 0; i < binders.length; i++) {
    builder.append('const ')
    builder.append(binders[i].variable)
    builder.append(' = ')
    buildTerm(binders[i].body, builder)
    builder.append(';')
  }
  if (body.tag == 'TmBlock') {
    buildTermBlock(body, builder)
  } else {
    buildTerm(body, builder)
    builder.append(';')
  }
}

function buildTermBlock(block: TermBlock, builder: StringBuilder) {
  for (let i = 0; i < block.statements.length; i++) {
    buildTerm(block.statements[i], builder)
    builder.append(';')
  }
}

function buildTmDo(tm: TmDo, builder: StringBuilder) {
  buildTermBlock(tm.block, builder)
}

function buildTmIf(tm: TmIf, builder: StringBuilder) {}

function buildTmWhile(tm: TmWhile, builder: StringBuilder) {}

function buildTmFor(tm: TmFor, builder: StringBuilder) {}
