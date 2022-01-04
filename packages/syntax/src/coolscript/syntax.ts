export type Var = string

export type Value = VNumber | VString | VBool | VObject | VError

// Integer, double, etc.
export type VNumber = {
  tag: 'VNumber'
  num: number
}

// Single, double, and quasi-quoted
export type VString = {
  tag: 'VString'
  str: string
}

// true, false (reserved words)
export type VBool = {
  tag: 'VBool'
  bool: boolean
}

// { key1: value, key2: value, ...etc }
export type VObject = {
  tag: 'VObject'
  obj: { [key: string]: Value }
}

// error 'message'
export type VError = {
  tag: 'VError'
  err: string
}

export type Term = TmVar | TmLam | TmCall | TmValue | TmLet | TmSeq | TmBind

export type TmVar = {
  tag: 'TmVar'
  var: Var
}

// (x, y) => f(x, y)
export type TmLam = {
  tag: 'TmLam'
  lam: { args: Var[]; body: Term }
}

// f(x, y)
export type TmCall = {
  tag: 'TmCall'
  call: { caller: Term; args: Term[] }
}

export type TmValue = {
  tag: 'TmValue'
  value: Value
}

// v = x
export type Binding = {
  var: Var
  body: Term
}

// let v = x; u = y in f(v, u)
export type TmLet = {
  tag: 'TmLet'
  let: { binders: Binding[]; body: Term }
}

// x; y
export type TmSeq = {
  tag: 'TmSeq'
  seq: { a: Term; b: Term }
}

// v = x; y v
export type TmBind = {
  tag: 'TmBind'
  bind: { binding: Binding; body: Term }
}
