export type Var = string

export type Value = VNumber | VString | VBool | VObject | VError

// Integer, double, etc.
export type VNumber = {
  tag: 'VNumber'
  num: number
}

export function VNumber(num: number): Value {
  return { tag: 'VNumber', num }
}

// Single, double, and quasi-quoted
export type VString = {
  tag: 'VString'
  str: string
}

export function VString(str: string): Value {
  return { tag: 'VString', str }
}

// true, false (reserved words)
export type VBool = {
  tag: 'VBool'
  bool: boolean
}

export function VBool(bool: boolean): Value {
  return { tag: 'VBool', bool }
}

// { key1: value, key2: value, ...etc }
export type VObject = {
  tag: 'VObject'
  obj: { [key: string]: Value }
}

export function VObject(obj: { [key: string]: Value }): Value {
  return { tag: 'VObject', obj }
}

// error 'message'
export type VError = {
  tag: 'VError'
  err: string
}

export function VError(err: string): Value {
  return { tag: 'VError', err }
}

export type Term = TmVar | TmLam | TmCall | TmValue | TmLet | TmSeq | TmBind

export type TmVar = {
  tag: 'TmVar'
  variable: Var
}

export function TmVar(variable: Var): Term {
  return { tag: 'TmVar', variable }
}

// (x, y) => f(x, y)
export type TmLam = {
  tag: 'TmLam'
  lam: { args: Var[]; body: Term }
}

export function TmLam(args: Var[], body: Term): Term {
  return { tag: 'TmLam', lam: { args, body } }
}

// f(x, y)
export type TmCall = {
  tag: 'TmCall'
  call: { caller: Term; args: Term[] }
}

export function TmCall(caller: Term, args: Term[]): Term {
  return { tag: 'TmCall', call: { caller, args } }
}

export type TmValue = {
  tag: 'TmValue'
  value: Value
}

export function TmValue(value: Value): Term {
  return { tag: 'TmValue', value }
}

// v = x
export type Binding = {
  variable: Var
  body: Term
}

export function Binding(variable: Var, body: Term): Binding {
  return { variable, body }
}

// let v = x; u = y in f(v, u)
export type TmLet = {
  tag: 'TmLet'
  let: { binders: Binding[]; body: Term }
}

export function TmLet(binders: Binding[], body: Term): Term {
  return { tag: 'TmLet', let: { binders, body } }
}

// x; y
export type TmSeq = {
  tag: 'TmSeq'
  seq: { a: Term; b: Term }
}

export function TmSeq(a: Term, b: Term): Term {
  return { tag: 'TmSeq', seq: { a, b } }
}

// v = x; y v
export type TmBind = {
  tag: 'TmBind'
  bind: { binding: Binding; body: Term }
}

export function TmBind(v: Var, a: Term, b: Term): Term {
  return { tag: 'TmBind', bind: { binding: Binding(v, a), body: b } }
}
