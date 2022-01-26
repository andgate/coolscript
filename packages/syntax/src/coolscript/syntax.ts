export type Variable = string

export type Property<A> = {
  tag: 'Property'
  id: string
  ann: A
}

export type ObjectMap<T> = { [key: string]: T }

// Atomic Values
export type AtomicValue<A> =
  | NullValue<A>
  | NumberValue<A>
  | StringValue<A>
  | BooleanValue<A>

// null value
export type NullValue<A> = {
  tag: 'NullValue'
  ann: A
}

export function NullValue<A>(ann: A): NullValue<A> {
  return { tag: 'NullValue', ann }
}

// Integer, double, etc.
export type NumberValue<A> = {
  tag: 'NumberValue'
  num: number
  ann: A
}

export function NumberValue<A>(num: number, ann: A): NumberValue<A> {
  return { tag: 'NumberValue', num, ann }
}

// Single, double, and quasi-quoted
export type StringValue<A> = {
  tag: 'StringValue'
  str: string
  ann: A
}

export function StringValue<A>(str: string, ann: A): StringValue<A> {
  return { tag: 'StringValue', str, ann }
}

// true, false (reserved words)
export type BooleanValue<A> = {
  tag: 'BooleanValue'
  bool: boolean
  ann: A
}

export function BooleanValue<A>(bool: boolean, ann: A): BooleanValue<A> {
  return { tag: 'BooleanValue', bool, ann }
}

export type Term<A> =
  | ErrorTerm<A>
  | ValueTerm<A>
  | VariableTerm<A>
  | AssignmentTerm<A>
  | LambdaTerm<A>
  | CallTerm<A>
  | ParentheticalTerm<A>
  | ArrayTerm<A>
  | ObjectTerm<A>
  | MemberAccessTerm<A>
  | IndexAccessTerm<A>
  | LetTerm<A>
  | DoTerm<A>
  | ConditionalTerm<A>

export type ErrorTerm<A> = {
  tag: 'ErrorTerm'
  msg: string
  ann: A
}

export function ErrorTerm<A>(msg: string, ann: A): ErrorTerm<A> {
  return { tag: 'ErrorTerm', msg, ann }
}

export type ValueTerm<A> = {
  tag: 'ValueTerm'
  value: AtomicValue<A>
  ann: A
}

export function ValueTerm<A>(value: AtomicValue<A>, ann: A): ValueTerm<A> {
  return { tag: 'ValueTerm', value, ann }
}

export type VariableTerm<A> = {
  tag: 'VariableTerm'
  variable: Variable
  ann: A
}

export function VariableTerm<A>(variable: Variable, ann: A): VariableTerm<A> {
  return { tag: 'VariableTerm', variable, ann }
}

// x = t
export type AssignmentTerm<A> = {
  tag: 'AssignmentTerm'
  lhs: Variable
  rhs: Term<A>
  ann: A
}

export function AssignmentTerm<A>(
  lhs: Variable,
  rhs: Term<A>,
  ann: A
): AssignmentTerm<A> {
  return { tag: 'AssignmentTerm', lhs, rhs, ann }
}

// (x, y) => f(x, y)
export type LambdaTerm<A> = {
  tag: 'LambdaTerm'
  args: Array<Variable>
  body: Term<A>
  ann: A
}

export function LambdaTerm<A>(
  args: Array<Variable>,
  body: Term<A>,
  ann: A
): LambdaTerm<A> {
  return { tag: 'LambdaTerm', args, body, ann }
}

// f(x, y)
export type CallTerm<A> = {
  tag: 'CallTerm'
  func: Term<A>
  args: Array<Term<A>>
  ann: A
}

export function CallTerm<A>(
  func: Term<A>,
  args: Array<Term<A>>,
  ann: A
): CallTerm<A> {
  return { tag: 'CallTerm', func, args, ann }
}

// let v = x; u = y in f(v, u)
// let v = x; u = y do { ... }
export type LetTerm<A> = {
  tag: 'LetTerm'
  declarations: Array<Declaration<A>>
  body: Term<A>
  ann: A
}

export function LetTerm<A>(
  declarations: Array<Declaration<A>>,
  body: Term<A>,
  ann: A
): LetTerm<A> {
  return { tag: 'LetTerm', declarations, body, ann }
}

// v = x
// Definition, not assignment.
export type Declaration<A> = VariableDeclaration<A>

export type VariableDeclaration<A> = {
  tag: 'VariableDeclaration'
  variable: Variable
  body: Term<A>
  ann: A
}

export function VariableDeclaration<A>(
  variable: Variable,
  body: Term<A>,
  ann: A
): VariableDeclaration<A> {
  return { tag: 'VariableDeclaration', variable, body, ann }
}

// (t)
export type ParentheticalTerm<A> = {
  tag: 'ParentheticalTerm'
  term: Term<A>
  ann: A
}

export function ParentheticalTerm<A>(
  term: Term<A>,
  ann: A
): ParentheticalTerm<A> {
  return { tag: 'ParentheticalTerm', term, ann }
}

// [ x1, x2, ..., xn ]
export type ArrayTerm<A> = {
  tag: 'ArrayTerm'
  elements: Term<A>[]
  ann: A
}

export function ArrayTerm<A>(elements: Term<A>[], ann: A): ArrayTerm<A> {
  return { tag: 'ArrayTerm', elements, ann }
}

// { a1: x1, a2: x2, ..., an: xn }
export type ObjectTerm<A> = {
  tag: 'ObjectTerm'
  entries: ObjectMap<Term<A>>
  ann: A
}

export function ObjectTerm<A>(
  entries: ObjectMap<Term<A>>,
  ann: A
): ObjectTerm<A> {
  return { tag: 'ObjectTerm', entries, ann }
}

export type MemberName = string

export type MemberAccessTerm<A> = {
  tag: 'MemberAccessTerm'
  object: Term<A>
  member: MemberName
  ann: A
}

// t.m
export function MemberAccessTerm<A>(
  object: Term<A>,
  member: Variable,
  ann: A
): MemberAccessTerm<A> {
  return {
    tag: 'MemberAccessTerm',
    object,
    member,
    ann
  }
}

// t[i]
export type IndexAccessTerm<A> = {
  tag: 'IndexAccessTerm'
  array: Term<A>
  index: Term<A>
  ann: A
}

export function IndexAccessTerm<A>(
  array: Term<A>,
  index: Term<A>,
  ann: A
): IndexAccessTerm<A> {
  return { tag: 'IndexAccessTerm', array, index, ann }
}

// do { s1; s2; ...; sn; }
export type DoTerm<A> = {
  tag: 'DoTerm'
  block: BlockStatement<A>
  ann: A
}

export function DoTerm<A>(block: BlockStatement<A>, ann: A): DoTerm<A> {
  return { tag: 'DoTerm', block, ann }
}

// if (p) t
// if (p) t1 else t2
// if (p) t1 elif t2
// if (p) t1 elif t2 else t3
export type ConditionalTerm<A> = {
  tag: 'ConditionalTerm'
  condition: Term<A>
  body: Term<A>
  branch: BranchTerm<A>
  ann: A
}

export function ConditionalTerm<A>(
  condition: Term<A>,
  body: Term<A>,
  branch: BranchTerm<A>,
  ann: A
): ConditionalTerm<A> {
  return { tag: 'ConditionalTerm', condition, body, branch, ann }
}

export type BranchTerm<A> = ElifTerm<A> | ElseTerm<A>

export type ElifTerm<A> = {
  tag: 'ElifTerm'
  condition: Term<A>
  body: Term<A>
  branch: BranchTerm<A>
  ann: A
}

export function ElifTerm<A>(
  condition: Term<A>,
  body: Term<A>,
  branch: BranchTerm<A>,
  ann: A
): ElifTerm<A> {
  return { tag: 'ElifTerm', condition, body, branch, ann }
}

export type ElseTerm<A> = {
  tag: 'ElseTerm'
  body: Term<A>
  ann: A
}

export function ElseTerm<A>(body: Term<A>, ann: A): ElseTerm<A> {
  return { tag: 'ElseTerm', body, ann }
}

export type Statement<A> =
  | AssignmentStatement<A>
  | CallStatement<A>
  | ReturnStatement<A>
  | BlockStatement<A>
  | IfStatement<A>
  | WhileStatement<A>
  | DoWhileStatement<A>
  | ForStatement<A>

export type AssignmentStatement<A> = {
  tag: 'AssignmentStatement'
  lhs: Variable
  rhs: Term<A>
  ann: A
}

export function AssignmentStatement<A>(
  lhs: Variable,
  rhs: Term<A>,
  ann: A
): AssignmentStatement<A> {
  return { tag: 'AssignmentStatement', lhs, rhs, ann }
}

export type CallStatement<A> = {
  tag: 'CallStatement'
  func: Term<A>
  args: Array<Term<A>>
  ann: A
}

export function CallStatement<A>(
  func: Term<A>,
  args: Array<Term<A>>,
  ann: A
): CallStatement<A> {
  return { tag: 'CallStatement', func, args, ann }
}

export type ReturnStatement<A> = {
  tag: 'ReturnStatement'
  result: Term<A>
  ann: A
}

export function ReturnStatement<A>(
  result: Term<A>,
  ann: A
): ReturnStatement<A> {
  return { tag: 'ReturnStatement', result, ann }
}

export type BlockStatement<A> = {
  tag: 'BlockStatement'
  statements: Array<Statement<A>>
  ann: A
}

export function BlockStatement<A>(
  statements: Array<Statement<A>>,
  ann: A
): BlockStatement<A> {
  return { tag: 'BlockStatement', statements, ann }
}

// if (t) s
// if (t) s1 else s2
// if (t1) s1 elif (t2) s2
// if (t1) s1 elif (t2) s2 else t3
export type IfStatement<A> = {
  tag: 'IfStatement'
  condition: Term<A>
  body: Statement<A>
  branch?: BranchStatement<A>
  ann: A
}

export function IfStatement<A>(
  condition: Term<A>,
  body: Statement<A>,
  branch: BranchStatement<A> | null,
  ann: A
): IfStatement<A> {
  return { tag: 'IfStatement', condition, body, branch, ann }
}

export type BranchStatement<A> = ElifStatement<A> | ElseStatement<A>

export type ElifStatement<A> = {
  tag: 'ElifStatement'
  condition: Term<A>
  body: Statement<A>
  branch?: BranchStatement<A>
  ann: A
}

export function ElifStatement<A>(
  condition: Term<A>,
  body: Statement<A>,
  branch: BranchStatement<A> | null,
  ann: A
): ElifStatement<A> {
  return { tag: 'ElifStatement', condition, body, branch, ann }
}

export type ElseStatement<A> = {
  tag: 'ElseStatement'
  body: Statement<A>
  ann: A
}

export function ElseStatement<A>(body: Statement<A>, ann: A): ElseStatement<A> {
  return { tag: 'ElseStatement', body, ann }
}

// while (t) s
export type WhileStatement<A> = {
  tag: 'WhileStatement'
  condition: Term<A>
  body: Statement<A>
  ann: A
}

export function WhileStatement<A>(
  condition: Term<A>,
  body: Statement<A>,
  ann: A
): WhileStatement<A> {
  return { tag: 'WhileStatement', condition, body, ann }
}

// while (t) s
export type DoWhileStatement<A> = {
  tag: 'DoWhileStatement'
  body: Statement<A>
  condition: Term<A>
  ann: A
}

export function DoWhileStatement<A>(
  body: Statement<A>,
  condition: Term<A>,
  ann: A
): DoWhileStatement<A> {
  return { tag: 'DoWhileStatement', body, condition, ann }
}

// for (t1; t2; t3) s
export type ForStatement<A> = {
  tag: 'ForStatement'
  declarations: Array<VariableDeclaration<A>>
  condition: Term<A>
  update: Term<A>
  body: Statement<A>
  ann: A
}

export function ForStatement<A>(
  declarations: Array<VariableDeclaration<A>>,
  condition: Term<A>,
  update: Term<A>,
  body: Statement<A>,
  ann: A
): ForStatement<A> {
  return { tag: 'ForStatement', declarations, condition, update, body, ann }
}
