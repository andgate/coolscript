import * as Syntax from '@coolscript/syntax'
import { Span, Merge } from '@coolscript/syntax'
import { Token } from './token'

export function VariableDeclaration(
  lhs: Token,
  rhs: Syntax.Term
): Syntax.VariableDeclaration {
  return Syntax.VariableDeclaration(lhs.text, rhs, Merge(lhs.span, rhs.span))
}

export function NullValue(t: Token): Syntax.NullValue {
  return Syntax.NullValue(t.span)
}

export function NumberValue(t: Token): Syntax.NumberValue {
  const num = parseFloat(t.text)
  return Syntax.NumberValue(num, t.span)
}

export function StringValue(t: Token): Syntax.StringValue {
  const sourceText = t.text
  const text = sourceText.substring(1, sourceText.length - 1)
  return Syntax.StringValue(text, t.span)
}

export function TrueValue(t: Token): Syntax.BooleanValue {
  return Syntax.BooleanValue(true, t.span)
}
export function FalseValue(t: Token): Syntax.BooleanValue {
  return Syntax.BooleanValue(false, t.span)
}

export function ErrorTerm(msg: string, span: Span): Syntax.ErrorTerm {
  return Syntax.ErrorTerm(msg, span)
}

export function ValueTerm(value: Syntax.AtomicValue): Syntax.ValueTerm {
  return Syntax.ValueTerm(value, value.span)
}

export function VariableTerm(variableToken: Token): Syntax.VariableTerm {
  return Syntax.VariableTerm(variableToken.text, variableToken.span)
}

export function AssignmentTerm(
  lhs: Token,
  rhs: Syntax.Term
): Syntax.AssignmentTerm {
  return Syntax.AssignmentTerm(lhs.text, rhs, Merge(lhs.span, rhs.span))
}

export function LambdaTerm(
  args: Array<Syntax.Variable>,
  body: Syntax.Term,
  span: Span
): Syntax.LambdaTerm {
  return Syntax.LambdaTerm(args, body, span)
}

export function CallTerm(
  func: Syntax.Term,
  args: Array<Syntax.Term>,
  span: Span
): Syntax.CallTerm {
  return Syntax.CallTerm(func, args, span)
}

export function LetTerm(
  declarations: Array<Syntax.Declaration>,
  body: Syntax.Term,
  span: Span
): Syntax.LetTerm {
  return Syntax.LetTerm(declarations, body, span)
}

export function ParentheticalTerm(
  term: Syntax.Term,
  span: Span
): Syntax.ParentheticalTerm {
  return Syntax.ParentheticalTerm(term, span)
}

export function ArrayTerm(
  elements: Array<Syntax.Term>,
  span: Span
): Syntax.ArrayTerm {
  return Syntax.ArrayTerm(elements, span)
}

export function ObjectTerm(
  entries: Syntax.ObjectMap<Syntax.Term>,
  span: Span
): Syntax.ObjectTerm {
  return Syntax.ObjectTerm(entries, span)
}

export function MemberAccessTerm(
  object: Syntax.Term,
  memberToken: Token
): Syntax.MemberAccessTerm {
  return Syntax.MemberAccessTerm(
    object,
    memberToken.text,
    Merge(object.span, memberToken.span)
  )
}

export function IndexAccessTerm(
  array: Syntax.Term,
  index: Syntax.Term,
  span: Span
): Syntax.IndexAccessTerm {
  return Syntax.IndexAccessTerm(array, index, span)
}

export function DoTerm(
  block: Syntax.BlockStatement,
  span: Span
): Syntax.DoTerm {
  return Syntax.DoTerm(block, span)
}

export function ConditionalTerm(
  condition: Syntax.Term,
  body: Syntax.Term,
  branch: Syntax.BranchTerm,
  span: Span
): Syntax.ConditionalTerm {
  return Syntax.ConditionalTerm(condition, body, branch, span)
}

export function ElifTerm(
  condition: Syntax.Term,
  body: Syntax.Term,
  branch: Syntax.BranchTerm,
  span: Span
): Syntax.ElifTerm {
  return Syntax.ElifTerm(condition, body, branch, span)
}

export function ElseTerm(body: Syntax.Term, span: Span): Syntax.ElseTerm {
  return Syntax.ElseTerm(body, span)
}

export function AssignmentStatement(
  lhs: Token,
  rhs: Syntax.Term
): Syntax.AssignmentStatement {
  return Syntax.AssignmentStatement(lhs.text, rhs, Merge(lhs.span, rhs.span))
}

export function CallStatement(
  func: Syntax.Term,
  args: Array<Syntax.Term>,
  span: Span
): Syntax.CallStatement {
  return Syntax.CallStatement(func, args, span)
}

export function ReturnStatement(
  result: Syntax.Term,
  span: Span
): Syntax.ReturnStatement {
  return Syntax.ReturnStatement(result, span)
}

export function BlockStatement(
  statements: Array<Syntax.Statement>,
  span: Span
): Syntax.BlockStatement {
  return Syntax.BlockStatement(statements, span)
}

export function IfStatement(
  condition: Syntax.Term,
  body: Syntax.Statement,
  branch: Syntax.BranchStatement | null,
  span: Span
): Syntax.IfStatement {
  return Syntax.IfStatement(condition, body, branch, span)
}

export function ElifStatement(
  condition: Syntax.Term,
  body: Syntax.Statement,
  branch: Syntax.BranchStatement | null,
  span: Span
): Syntax.ElifStatement {
  return Syntax.ElifStatement(condition, body, branch, span)
}

export function ElseStatement(
  body: Syntax.Statement,
  span: Span
): Syntax.ElseStatement {
  return Syntax.ElseStatement(body, span)
}

export function WhileStatement(
  condition: Syntax.Term,
  body: Syntax.Statement,
  span: Span
): Syntax.WhileStatement {
  return Syntax.WhileStatement(condition, body, span)
}

export function DoWhileStatement(
  body: Syntax.Statement,
  condition: Syntax.Term,
  span: Span
): Syntax.DoWhileStatement {
  return Syntax.DoWhileStatement(body, condition, span)
}

export function ForStatement(
  declarations: Array<Syntax.VariableDeclaration> | null | undefined,
  condition: Syntax.Term,
  update: Syntax.Term,
  body: Syntax.Statement,
  span: Span
): Syntax.ForStatement {
  return Syntax.ForStatement(declarations, condition, update, body, span)
}
