export type Var = string

export type ObjectF<T> = { [key: string]: T }

// Values
export type Value = AValue | VLam | VArray | VObject | VError

// Atomic Values
export type AValue = VNull | VNumber | VString | VBool

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

export function VNumber(num: number): VNumber {
  return { tag: 'VNumber', num }
}

// Single, double, and quasi-quoted
export type VString = {
  tag: 'VString'
  str: string
}

export function VString(str: string): VString {
  return { tag: 'VString', str }
}

// true, false (reserved words)
export type VBool = {
  tag: 'VBool'
  bool: boolean
}

export function VBool(bool: boolean): VBool {
  return { tag: 'VBool', bool }
}

export type VLam = {
  tag: 'VLam'
  args: Var[]
  body: Term
}

export function VLam(args: Var[], body: Term): VLam {
  return { tag: 'VLam', args, body }
}

// [ x1, x2, ..., xn ]
export type VArray = {
  tag: 'VArray'
  elements: Value[]
}

export function VArray(elements: Value[]): VArray {
  return { tag: 'VArray', elements }
}

// { key1: value, key2: value, ...etc }
export type VObject = {
  tag: 'VObject'
  obj: ObjectF<Value>
}

export function VObject(obj: ObjectF<Value>): VObject {
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

export type TermBlock = {
  tag: 'TmBlock'
  statements: Term[]
}

export function TermBlock(statements: Term[]): TermBlock {
  return { tag: 'TmBlock', statements }
}

export type Term =
  | TmError
  | TmValue
  | TmVar
  | TmAssign
  | TmLam
  | TmReturn
  | TmCall
  | TmParens
  | TmArray
  | TmObject
  | TmLet
  | TmDo
  | TmIf
  | TmWhile
  | TmFor

export type TmError = {
  tag: 'TmError'
  ann: any
  msg: string
}

export function TmError(msg: string, ann: any = null): TmError {
  return { tag: 'TmError', ann, msg }
}

export type TmValue = {
  tag: 'TmValue'
  ann: any
  value: AValue
}

export function TmValue(value: AValue, ann: any = null): TmValue {
  return { tag: 'TmValue', ann, value }
}

export type TmVar = {
  tag: 'TmVar'
  ann: any
  variable: Var
}

export function TmVar(variable: Var, ann: any = null): TmVar {
  return { tag: 'TmVar', ann, variable }
}

// x = t
export type TmAssign = {
  tag: 'TmAssign'
  ann: any
  lhs: string
  rhs: Term
}

export function TmAssign(lhs: string, rhs: Term, ann: any = null): TmAssign {
  return { tag: 'TmAssign', ann, lhs, rhs }
}

// (x, y) => f(x, y)
export type TmLam = {
  tag: 'TmLam'
  ann: any
  args: Var[]
  body: Term
}

export function TmLam(args: Var[], body: Term, ann: any = null): TmLam {
  return { tag: 'TmLam', ann, args, body }
}

// return t
export type TmReturn = {
  tag: 'TmReturn'
  ann: any
  result: Term
}

export function TmReturn(result: Term, ann: any = null): TmReturn {
  return { tag: 'TmReturn', ann, result }
}

// f(x, y)
export type TmCall = {
  tag: 'TmCall'
  ann: any
  caller: Term
  args: Term[]
}

export function TmCall(caller: Term, args: Term[], ann: any = null): TmCall {
  return { tag: 'TmCall', ann, caller, args }
}

// let v = x; u = y in f(v, u)
// let v = x; u = y do { ... }
export type TmLet = {
  tag: 'TmLet'
  ann: any
  binders: Binding[]
  body: Term | TermBlock
}

export function TmLet(
  binders: Binding[],
  body: Term | TermBlock,
  ann: any = null
): TmLet {
  return { tag: 'TmLet', ann, binders, body }
}

// v = x
// Definition, not assignment.
export type Binding = {
  variable: Var
  body: Term
}

export function Binding(variable: Var, body: Term): Binding {
  return { variable, body }
}

// (t)
export type TmParens = {
  tag: 'TmParens'
  ann: any
  term: Term
}

export function TmParens(term: Term, ann: any = null): TmParens {
  return { tag: 'TmParens', ann, term }
}

// [ x1, x2, ..., xn ]
export type TmArray = {
  tag: 'TmArray'
  ann: any
  elements: Term[]
}

export function TmArray(elements: Term[] = [], ann: any = null): TmArray {
  return { tag: 'TmArray', ann, elements }
}

// { a1: x1, a2: x2, ..., an: xn }
export type TmObject = {
  tag: 'TmObject'
  ann: any
  obj: ObjectF<Term>
}

export function TmObject(obj: ObjectF<Term> = {}, ann: any = null): TmObject {
  return { tag: 'TmObject', ann, obj }
}

// do { t1; ...; tn }
export type TmDo = {
  tag: 'TmDo'
  ann: any
  block: TermBlock
}

export function TmDo(block: TermBlock, ann: any = null): TmDo {
  return { tag: 'TmDo', ann, block }
}

// if (p) t
// if (p) t1 else t2
// if (p) t1 elif t2
// if (p) t1 elif t2 else t3
export type TmIf = {
  tag: 'TmIf'
  ann: any
  pred: Term
  body: Term
  branch: Branch | null
}

export function TmIf(
  pred: Term,
  body: Term,
  branch: Branch | null = null,
  ann: any = null
): TmIf {
  return { tag: 'TmIf', ann, pred, body, branch }
}

export type Branch = ElifBranch | ElseBranch

export type ElifBranch = {
  tag: 'Elif'
  pred: Term
  body: Term
  branch: Branch | null
}

export function ElifBranch(
  pred: Term,
  body: Term,
  branch: Branch | null = null
): ElifBranch {
  return { tag: 'Elif', pred, body, branch }
}

export type ElseBranch = {
  tag: 'Else'
  body: Term
}

export function ElseBranch(body: Term): ElseBranch {
  return { tag: 'Else', body }
}

// while (t1) t2
export type TmWhile = {
  tag: 'TmWhile'
  ann: any
  pred: Term
  body: Term
}

export function TmWhile(pred: Term, body: Term, ann: any = null): TmWhile {
  return { tag: 'TmWhile', ann, pred, body }
}

// for (t1; t2; t3) t4
export type TmFor = {
  tag: 'TmFor'
  ann: any
  init: Term
  pred: Term
  iter: Term
  body: Term
}

export function TmFor(
  init: Term,
  pred: Term,
  iter: Term,
  body: Term,
  ann: any = null
): TmFor {
  return { tag: 'TmFor', ann, init, pred, iter, body }
}
