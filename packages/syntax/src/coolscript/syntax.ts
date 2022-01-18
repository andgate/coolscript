export type Var = string

export type Value = VNull | VNumber | VString | VBool | VObject | VError

// null value
export type VNull = {
  tag: 'VNull'
}

export const VNull: VNull = { tag: 'VNull' }

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

export type Term =
  | TmNull
  | TmVar
  | TmLam
  | TmCall
  | TmValue
  | TmObject
  | TmLet
  | TmDo
  | TmBind

export type TmNull = { tag: 'TmNull'; value: VNull }
export const TmNull: TmNull = { tag: 'TmNull', value: VNull }

export type TmVar = {
  tag: 'TmVar'
  variable: Var
}

export function TmVar(variable: Var): Term {
  return { tag: 'TmVar', variable }
}

export type TmValue = {
  tag: 'TmValue'
  value: Value
}

export function TmValue(value: Value): Term {
  return { tag: 'TmValue', value }
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

export type TmObject = {
  tag: 'TmObject'
  obj: { [key: string]: Term }
}

export function TmObject(obj: { [key: string]: Term }): Term {
  return { tag: 'TmObject', obj }
}

// do { s1; ...; sn }
export type TmDo = {
  tag: 'TmDo'
  do: { statements: DoStatement[] }
}

export function TmDo(statements: DoStatement[]): Term {
  return { tag: 'TmDo', do: { statements } }
}

export type DoStatement = DoBind | DoCommand | DoReturn

// x <- t
export type DoBind = {
  tag: 'DoBind'
  bind: { lhs: string; rhs: Term }
}

export function DoBind(lhs: string, rhs: Term): DoBind {
  return { tag: 'DoBind', bind: { lhs, rhs } }
}

// t
export type DoCommand = {
  tag: 'DoCommand'
  command: { term: Term }
}

export function DoCommand(term: Term): DoCommand {
  return { tag: 'DoCommand', command: { term } }
}

// return t
export type DoReturn = {
  tag: 'DoReturn'
  return: { term: Term }
}

export function DoReturn(term: Term): DoReturn {
  return { tag: 'DoReturn', return: { term } }
}

// v = x; y v
export type TmBind = {
  tag: 'TmBind'
  bind: { binding: Binding; body: Term }
}

export function TmBind(v: Var, a: Term, b: Term): Term {
  return { tag: 'TmBind', bind: { binding: Binding(v, a), body: b } }
}

export function TmError(msg: string): Term {
  return TmValue(VError(msg))
}
