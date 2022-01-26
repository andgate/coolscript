import * as Core from '@coolscript/syntax'
import { Token } from './Token'
import { Span, Location, Merge } from './Span'

export type Variable = Core.Variable
export type Property = Core.Property<Location>
export type MemberName = Core.MemberName
export type ObjectMap<T> = Core.ObjectMap<T>

export type Declaration = Core.Declaration<Location>
export type VariableDeclaration = Core.VariableDeclaration<Location>

export type AtomicValue = Core.AtomicValue<Location>
export type NullValue = Core.NullValue<Location>
export type NumberValue = Core.NumberValue<Location>
export type StringValue = Core.StringValue<Location>
export type BooleanValue = Core.BooleanValue<Location>

export type Term = Core.Term<Location>
export type ErrorTerm = Core.ErrorTerm<Location>
export type ValueTerm = Core.ValueTerm<Location>
export type VariableTerm = Core.VariableTerm<Location>
export type AssignmentTerm = Core.AssignmentTerm<Location>
export type LambdaTerm = Core.LambdaTerm<Location>
export type CallTerm = Core.CallTerm<Location>
export type ParentheticalTerm = Core.ParentheticalTerm<Location>
export type ArrayTerm = Core.ArrayTerm<Location>
export type ObjectTerm = Core.ObjectTerm<Location>
export type MemberAccessTerm = Core.MemberAccessTerm<Location>
export type IndexAccessTerm = Core.IndexAccessTerm<Location>
export type LetTerm = Core.LetTerm<Location>
export type DoTerm = Core.DoTerm<Location>
export type ConditionalTerm = Core.ConditionalTerm<Location>
export type BranchTerm = Core.BranchTerm<Location>
export type ElifTerm = Core.ElifTerm<Location>
export type ElseTerm = Core.ElseTerm<Location>

export type Statement = Core.Statement<Location>
export type AssignmentStatement = Core.AssignmentStatement<Location>
export type CallStatement = Core.CallStatement<Location>
export type ReturnStatement = Core.ReturnStatement<Location>
export type BlockStatement = Core.BlockStatement<Location>
export type IfStatement = Core.IfStatement<Location>
export type BranchStatement = Core.BranchStatement<Location>
export type ElifStatement = Core.ElifStatement<Location>
export type ElseStatement = Core.ElseStatement<Location>
export type WhileStatement = Core.WhileStatement<Location>
export type DoWhileStatement = Core.DoWhileStatement<Location>
export type ForStatement = Core.ForStatement<Location>

export function VariableDeclaration(
  lhs: Token,
  rhs: Term
): VariableDeclaration {
  return Core.VariableDeclaration(lhs.text, rhs, {
    span: Merge(lhs.span, rhs.ann.span)
  })
}

export function NullValue(t: Token): NullValue {
  return Core.NullValue({ span: t.span })
}

export function NumberValue(t: Token): NumberValue {
  const num = parseFloat(t.text)
  return Core.NumberValue(num, { span: t.span })
}

export function StringValue(t: Token): StringValue {
  const sourceText = t.text
  const text = sourceText.substring(1, sourceText.length - 1)
  return Core.StringValue(text, { span: t.span })
}

export function TrueValue(t: Token): BooleanValue {
  return Core.BooleanValue(true, { span: t.span })
}
export function FalseValue(t: Token): BooleanValue {
  return Core.BooleanValue(false, { span: t.span })
}

export function ErrorTerm(msg: string, span: Span): ErrorTerm {
  return Core.ErrorTerm(msg, { span })
}

export function ValueTerm(value: AtomicValue): ValueTerm {
  return Core.ValueTerm(value, { span: value.ann.span })
}

export function VariableTerm(variableToken: Token): VariableTerm {
  return Core.VariableTerm(variableToken.text, { span: variableToken.span })
}

export function AssignmentTerm(lhs: Token, rhs: Term): AssignmentTerm {
  return Core.AssignmentTerm(lhs.text, rhs, {
    span: Merge(lhs.span, rhs.ann.span)
  })
}

export function LambdaTerm(
  args: Array<Variable>,
  body: Term,
  span: Span
): LambdaTerm {
  return Core.LambdaTerm(args, body, { span })
}

export function CallTerm(func: Term, args: Array<Term>, span: Span): CallTerm {
  return Core.CallTerm(func, args, { span })
}

export function LetTerm(
  declarations: Array<Declaration>,
  body: Term,
  span: Span
): LetTerm {
  return Core.LetTerm(declarations, body, { span })
}

export function ParentheticalTerm(term: Term, span: Span): ParentheticalTerm {
  return Core.ParentheticalTerm(term, { span })
}

export function ArrayTerm(elements: Array<Term>, span: Span): ArrayTerm {
  return Core.ArrayTerm(elements, { span })
}

export function ObjectTerm(entries: ObjectMap<Term>, span: Span): ObjectTerm {
  return Core.ObjectTerm(entries, { span })
}

export function MemberAccessTerm(
  object: Term,
  memberToken: Token
): MemberAccessTerm {
  return Core.MemberAccessTerm(object, memberToken.text, {
    span: Merge(object.ann.span, memberToken.span)
  })
}

export function IndexAccessTerm(
  array: Term,
  index: Term,
  span: Span
): IndexAccessTerm {
  return Core.IndexAccessTerm(array, index, { span })
}

export function DoTerm(block: BlockStatement, span: Span): DoTerm {
  return Core.DoTerm(block, { span })
}

export function ConditionalTerm(
  condition: Term,
  body: Term,
  branch: BranchTerm,
  span: Span
): ConditionalTerm {
  return Core.ConditionalTerm(condition, body, branch, { span })
}

export function ElifTerm(
  condition: Term,
  body: Term,
  branch: BranchTerm,
  span: Span
): ElifTerm {
  return Core.ElifTerm(condition, body, branch, { span })
}

export function ElseTerm(body: Term, span: Span): ElseTerm {
  return Core.ElseTerm(body, { span })
}

export function AssignmentStatement(
  lhs: Token,
  rhs: Term
): AssignmentStatement {
  return Core.AssignmentStatement(lhs.text, rhs, {
    span: Merge(lhs.span, rhs.ann.span)
  })
}

export function CallStatement(
  func: Term,
  args: Array<Term>,
  span: Span
): CallStatement {
  return Core.CallStatement(func, args, { span })
}

export function ReturnStatement(result: Term, span: Span): ReturnStatement {
  return Core.ReturnStatement(result, { span })
}

export function BlockStatement(
  statements: Array<Statement>,
  span: Span
): BlockStatement {
  return Core.BlockStatement(statements, { span })
}

export function IfStatement(
  condition: Term,
  body: Statement,
  branch: BranchStatement | null,
  span: Span
): IfStatement {
  return Core.IfStatement(condition, body, branch, { span })
}

export function ElifStatement(
  condition: Term,
  body: Statement,
  branch: BranchStatement | null,
  span: Span
): ElifStatement {
  return Core.ElifStatement(condition, body, branch, { span })
}

export function ElseStatement(body: Statement, span: Span): ElseStatement {
  return Core.ElseStatement(body, { span })
}

export function WhileStatement(
  condition: Term,
  body: Statement,
  span: Span
): WhileStatement {
  return Core.WhileStatement(condition, body, { span })
}

export function DoWhileStatement(
  body: Statement,
  condition: Term,
  span: Span
): DoWhileStatement {
  return Core.DoWhileStatement(body, condition, { span })
}

export function ForStatement(
  declarations: Array<VariableDeclaration> | null | undefined,
  condition: Term,
  update: Term,
  body: Statement,
  span: Span
): ForStatement {
  return Core.ForStatement(declarations, condition, update, body, { span })
}
