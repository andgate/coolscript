import { Span } from './span'

export type Variable = string

export type Property = {
  tag: 'Property'
  id: string
  span?: Span
}

export type ObjectMap<T> = { [key: string]: T }

// Atomic Values
export type AtomicValue = NullValue | NumberValue | StringValue | BooleanValue

// null value
export type NullValue = {
  tag: 'NullValue'
  span?: Span
}

export function NullValue(span?: Span): NullValue {
  return { tag: 'NullValue', span }
}

// Integer, double, etc.
export type NumberValue = {
  tag: 'NumberValue'
  num: number
  span?: Span
}

export function NumberValue(num: number, span?: Span): NumberValue {
  return { tag: 'NumberValue', num, span }
}

// Single, double, and quasi-quoted
export type StringValue = {
  tag: 'StringValue'
  str: string
  span?: Span
}

export function StringValue(str: string, span?: Span): StringValue {
  return { tag: 'StringValue', str, span }
}

// true, false (reserved words)
export type BooleanValue = {
  tag: 'BooleanValue'
  bool: boolean
  span?: Span
}

export function BooleanValue(bool: boolean, span?: Span): BooleanValue {
  return { tag: 'BooleanValue', bool, span }
}

export type Term =
  | ErrorTerm
  | ValueTerm
  | VariableTerm
  | AssignmentTerm
  | LambdaTerm
  | CallTerm
  | ParentheticalTerm
  | ArrayTerm
  | ObjectTerm
  | MemberAccessTerm
  | IndexAccessTerm
  | LetTerm
  | DoTerm
  | ConditionalTerm

export type ErrorTerm = {
  tag: 'ErrorTerm'
  msg: string
  span?: Span
}

export function ErrorTerm(msg: string, span?: Span): ErrorTerm {
  return { tag: 'ErrorTerm', msg, span }
}

export type ValueTerm = {
  tag: 'ValueTerm'
  value: AtomicValue
  span?: Span
}

export function ValueTerm(value: AtomicValue, span?: Span): ValueTerm {
  return { tag: 'ValueTerm', value, span }
}

export type VariableTerm = {
  tag: 'VariableTerm'
  variable: Variable
  span?: Span
}

export function VariableTerm(variable: Variable, span?: Span): VariableTerm {
  return { tag: 'VariableTerm', variable, span }
}

// x = t
export type AssignmentTerm = {
  tag: 'AssignmentTerm'
  lhs: Variable
  rhs: Term
  span?: Span
}

export function AssignmentTerm(
  lhs: Variable,
  rhs: Term,
  span?: Span
): AssignmentTerm {
  return { tag: 'AssignmentTerm', lhs, rhs, span }
}

// (x, y) => f(x, y)
export type LambdaTerm = {
  tag: 'LambdaTerm'
  args: Array<Variable>
  body: Term
  span?: Span
}

export function LambdaTerm(
  args: Array<Variable>,
  body: Term,
  span?: Span
): LambdaTerm {
  return { tag: 'LambdaTerm', args, body, span }
}

// f(x, y)
export type CallTerm = {
  tag: 'CallTerm'
  func: Term
  args: Array<Term>
  span?: Span
}

export function CallTerm(func: Term, args: Array<Term>, span?: Span): CallTerm {
  return { tag: 'CallTerm', func, args, span }
}

// let v = x; u = y in f(v, u)
// let v = x; u = y do { ... }
export type LetTerm = {
  tag: 'LetTerm'
  declarations: Array<Declaration>
  body: Term
  span?: Span
}

export function LetTerm(
  declarations: Array<Declaration>,
  body: Term,
  span?: Span
): LetTerm {
  return { tag: 'LetTerm', declarations, body, span }
}

// v = x
// Definition, not assignment.
export type Declaration = VariableDeclaration

export type VariableDeclaration = {
  tag: 'VariableDeclaration'
  variable: Variable
  body: Term
  span?: Span
}

export function VariableDeclaration(
  variable: Variable,
  body: Term,
  span?: Span
): VariableDeclaration {
  return { tag: 'VariableDeclaration', variable, body, span }
}

// (t)
export type ParentheticalTerm = {
  tag: 'ParentheticalTerm'
  term: Term
  span?: Span
}

export function ParentheticalTerm(term: Term, span?: Span): ParentheticalTerm {
  return { tag: 'ParentheticalTerm', term, span }
}

// [ x1, x2, ..., xn ]
export type ArrayTerm = {
  tag: 'ArrayTerm'
  elements: Term[]
  span?: Span
}

export function ArrayTerm(elements: Term[], span?: Span): ArrayTerm {
  return { tag: 'ArrayTerm', elements, span }
}

// { a1: x1, a2: x2, ..., an: xn }
export type ObjectTerm = {
  tag: 'ObjectTerm'
  entries: ObjectMap<Term>
  span?: Span
}

export function ObjectTerm(entries: ObjectMap<Term>, span?: Span): ObjectTerm {
  return { tag: 'ObjectTerm', entries, span }
}

export type MemberName = string

export type MemberAccessTerm = {
  tag: 'MemberAccessTerm'
  object: Term
  member: MemberName
  span?: Span
}

// t.m
export function MemberAccessTerm(
  object: Term,
  member: Variable,
  span?: Span
): MemberAccessTerm {
  return {
    tag: 'MemberAccessTerm',
    object,
    member,
    span
  }
}

// t[i]
export type IndexAccessTerm = {
  tag: 'IndexAccessTerm'
  array: Term
  index: Term
  span?: Span
}

export function IndexAccessTerm(
  array: Term,
  index: Term,
  span?: Span
): IndexAccessTerm {
  return { tag: 'IndexAccessTerm', array, index, span }
}

// do { s1; s2; ...; sn; }
export type DoTerm = {
  tag: 'DoTerm'
  block: BlockStatement
  span?: Span
}

export function DoTerm(block: BlockStatement, span?: Span): DoTerm {
  return { tag: 'DoTerm', block, span }
}

// if (p) t
// if (p) t1 else t2
// if (p) t1 elif t2
// if (p) t1 elif t2 else t3
export type ConditionalTerm = {
  tag: 'ConditionalTerm'
  condition: Term
  body: Term
  branch: BranchTerm
  span?: Span
}

export function ConditionalTerm(
  condition: Term,
  body: Term,
  branch: BranchTerm,
  span?: Span
): ConditionalTerm {
  return { tag: 'ConditionalTerm', condition, body, branch, span }
}

export type BranchTerm = ElifTerm | ElseTerm

export type ElifTerm = {
  tag: 'ElifTerm'
  condition: Term
  body: Term
  branch: BranchTerm
  span?: Span
}

export function ElifTerm(
  condition: Term,
  body: Term,
  branch: BranchTerm,
  span?: Span
): ElifTerm {
  return { tag: 'ElifTerm', condition, body, branch, span }
}

export type ElseTerm = {
  tag: 'ElseTerm'
  body: Term
  span?: Span
}

export function ElseTerm(body: Term, span?: Span): ElseTerm {
  return { tag: 'ElseTerm', body, span }
}

export type Statement =
  | AssignmentStatement
  | CallStatement
  | ReturnStatement
  | BlockStatement
  | IfStatement
  | WhileStatement
  | DoWhileStatement
  | ForStatement

export type AssignmentStatement = {
  tag: 'AssignmentStatement'
  lhs: Variable
  rhs: Term
  span?: Span
}

export function AssignmentStatement(
  lhs: Variable,
  rhs: Term,
  span?: Span
): AssignmentStatement {
  return { tag: 'AssignmentStatement', lhs, rhs, span }
}

export type CallStatement = {
  tag: 'CallStatement'
  func: Term
  args: Array<Term>
  span?: Span
}

export function CallStatement(
  func: Term,
  args: Array<Term>,
  span?: Span
): CallStatement {
  return { tag: 'CallStatement', func, args, span }
}

export type ReturnStatement = {
  tag: 'ReturnStatement'
  result: Term
  span?: Span
}

export function ReturnStatement(result: Term, span?: Span): ReturnStatement {
  return { tag: 'ReturnStatement', result, span }
}

export type BlockStatement = {
  tag: 'BlockStatement'
  statements: Array<Statement>
  span?: Span
}

export function BlockStatement(
  statements: Array<Statement>,
  span?: Span
): BlockStatement {
  return { tag: 'BlockStatement', statements, span }
}

// if (t) s
// if (t) s1 else s2
// if (t1) s1 elif (t2) s2
// if (t1) s1 elif (t2) s2 else t3
export type IfStatement = {
  tag: 'IfStatement'
  condition: Term
  body: Statement
  branch?: BranchStatement
  span?: Span
}

export function IfStatement(
  condition: Term,
  body: Statement,
  branch: BranchStatement | null,
  span?: Span
): IfStatement {
  return { tag: 'IfStatement', condition, body, branch, span }
}

export type BranchStatement = ElifStatement | ElseStatement

export type ElifStatement = {
  tag: 'ElifStatement'
  condition: Term
  body: Statement
  branch?: BranchStatement
  span?: Span
}

export function ElifStatement(
  condition: Term,
  body: Statement,
  branch: BranchStatement | null,
  span?: Span
): ElifStatement {
  return { tag: 'ElifStatement', condition, body, branch, span }
}

export type ElseStatement = {
  tag: 'ElseStatement'
  body: Statement
  span?: Span
}

export function ElseStatement(body: Statement, span?: Span): ElseStatement {
  return { tag: 'ElseStatement', body, span }
}

// while (t) s
export type WhileStatement = {
  tag: 'WhileStatement'
  condition: Term
  body: Statement
  span?: Span
}

export function WhileStatement(
  condition: Term,
  body: Statement,
  span?: Span
): WhileStatement {
  return { tag: 'WhileStatement', condition, body, span }
}

// while (t) s
export type DoWhileStatement = {
  tag: 'DoWhileStatement'
  body: Statement
  condition: Term
  span?: Span
}

export function DoWhileStatement(
  body: Statement,
  condition: Term,
  span?: Span
): DoWhileStatement {
  return { tag: 'DoWhileStatement', body, condition, span }
}

// for (t1; t2; t3) s
export type ForStatement = {
  tag: 'ForStatement'
  declarations: Array<VariableDeclaration>
  condition: Term
  update: Term
  body: Statement
  span?: Span
}

export function ForStatement(
  declarations: Array<VariableDeclaration>,
  condition: Term,
  update: Term,
  body: Statement,
  span?: Span
): ForStatement {
  return { tag: 'ForStatement', declarations, condition, update, body, span }
}
