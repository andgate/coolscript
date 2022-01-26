import * as Core from '@coolscript/syntax'
import * as Syntax from '@coolscript/syntax-concrete'
import { Location } from '@coolscript/syntax-concrete'
import { Scope, Scoped } from './Scope'
import { SymbolCS } from './SymbolCS'

export function scopeTerm(term: Syntax.Term, scope: Scope): Term {
  return Term(term, scope)
}

export type Variable = Core.Variable
export type Property = Core.Property<Location & Scoped>
export type MemberName = Core.MemberName
export type ObjectMap<T> = Core.ObjectMap<T>

export type Declaration = Core.Declaration<Location & Scoped>
export type VariableDeclaration = Core.VariableDeclaration<Location & Scoped>

export type AtomicValue = Core.AtomicValue<Location & Scoped>
export type NullValue = Core.NullValue<Location & Scoped>
export type NumberValue = Core.NumberValue<Location & Scoped>
export type StringValue = Core.StringValue<Location & Scoped>
export type BooleanValue = Core.BooleanValue<Location & Scoped>

export type Term = Core.Term<Location & Scoped>
export type ErrorTerm = Core.ErrorTerm<Location & Scoped>
export type ValueTerm = Core.ValueTerm<Location & Scoped>
export type VariableTerm = Core.VariableTerm<Location & Scoped>
export type AssignmentTerm = Core.AssignmentTerm<Location & Scoped>
export type LambdaTerm = Core.LambdaTerm<Location & Scoped>
export type CallTerm = Core.CallTerm<Location & Scoped>
export type ParentheticalTerm = Core.ParentheticalTerm<Location & Scoped>
export type ArrayTerm = Core.ArrayTerm<Location & Scoped>
export type ObjectTerm = Core.ObjectTerm<Location & Scoped>
export type MemberAccessTerm = Core.MemberAccessTerm<Location & Scoped>
export type IndexAccessTerm = Core.IndexAccessTerm<Location & Scoped>
export type LetTerm = Core.LetTerm<Location & Scoped>
export type DoTerm = Core.DoTerm<Location & Scoped>
export type ConditionalTerm = Core.ConditionalTerm<Location & Scoped>
export type BranchTerm = Core.BranchTerm<Location & Scoped>
export type ElifTerm = Core.ElifTerm<Location & Scoped>
export type ElseTerm = Core.ElseTerm<Location & Scoped>

export type Statement = Core.Statement<Location & Scoped>
export type AssignmentStatement = Core.AssignmentStatement<Location & Scoped>
export type CallStatement = Core.CallStatement<Location & Scoped>
export type ReturnStatement = Core.ReturnStatement<Location & Scoped>
export type BlockStatement = Core.BlockStatement<Location & Scoped>
export type IfStatement = Core.IfStatement<Location & Scoped>
export type BranchStatement = Core.BranchStatement<Location & Scoped>
export type ElifStatement = Core.ElifStatement<Location & Scoped>
export type ElseStatement = Core.ElseStatement<Location & Scoped>
export type WhileStatement = Core.WhileStatement<Location & Scoped>
export type DoWhileStatement = Core.DoWhileStatement<Location & Scoped>
export type ForStatement = Core.ForStatement<Location & Scoped>

export function Term(tm: Syntax.Term, scope: Scope): Term {
  switch (tm.tag) {
    case 'ErrorTerm':
      return ErrorTerm(tm, scope)
    case 'ValueTerm':
      return ValueTerm(tm, scope)
    case 'VariableTerm':
      return VariableTerm(tm, scope)
    case 'AssignmentTerm':
      return AssignmentTerm(tm, scope)
    case 'LambdaTerm':
      return LambdaTerm(tm, scope)
    case 'CallTerm':
      return CallTerm(tm, scope)
    case 'ParentheticalTerm':
      return ParentheticalTerm(tm, scope)
    case 'ArrayTerm':
      return ArrayTerm(tm, scope)
    case 'ObjectTerm':
      return ObjectTerm(tm, scope)
    case 'MemberAccessTerm':
      return MemberAccessTerm(tm, scope)
    case 'IndexAccessTerm':
      return IndexAccessTerm(tm, scope)
    case 'LetTerm':
      return LetTerm(tm, scope)
    case 'DoTerm':
      return DoTerm(tm, scope)
    case 'ConditionalTerm':
      return ConditionalTerm(tm, scope)
    default: {
      throw Error(
        `scopedTerm: Unrecognized term tag encountered: ${JSON.stringify(tm)}`
      )
    }
  }
}

export function Declaration(
  declaration: Syntax.Declaration,
  scope: Scope
): VariableDeclaration {
  switch (declaration.tag) {
    case 'VariableDeclaration':
      return VariableDeclaration(declaration, scope)
  }
}

export function VariableDeclaration(
  declaration: Syntax.VariableDeclaration,
  scope: Scope
): VariableDeclaration {
  const variable = declaration.variable
  const body = Term(declaration.body, scope)
  const ann = { ...declaration.ann, scope }
  return Core.VariableDeclaration(variable, body, ann)
}

export function AtomicValue(
  value: Syntax.AtomicValue,
  scope: Scope
): AtomicValue {
  switch (value.tag) {
    case 'BooleanValue':
      return BooleanValue(value, scope)
    case 'NullValue':
      return NullValue(value, scope)
    case 'NumberValue':
      return NumberValue(value, scope)
    case 'StringValue':
      return StringValue(value, scope)
  }
}

export function BooleanValue(
  value: Syntax.BooleanValue,
  scope: Scope
): BooleanValue {
  const bool = value.bool
  const ann = { ...value.ann, scope }
  return Core.BooleanValue(bool, ann)
}

export function NullValue(
  nullValue: Syntax.NullValue,
  scope: Scope
): NullValue {
  return Core.NullValue({ ...nullValue.ann, scope })
}

export function NumberValue(
  value: Syntax.NumberValue,
  scope: Scope
): NumberValue {
  const num = value.num
  const ann = { ...value.ann, scope }
  return Core.NumberValue(num, ann)
}

export function StringValue(
  value: Syntax.StringValue,
  scope: Scope
): StringValue {
  const str = value.str
  const ann = { ...value.ann, scope }
  return Core.StringValue(str, ann)
}

export function ErrorTerm(tm: Syntax.ErrorTerm, scope: Scope): ErrorTerm {
  const ann = { ...tm.ann, scope }
  return Core.ErrorTerm(tm.msg, ann)
}

export function ValueTerm(tm: Syntax.ValueTerm, scope: Scope): ValueTerm {
  const value = AtomicValue(tm.value, scope)
  const ann = { ...tm.ann, scope }
  return Core.ValueTerm(value, ann)
}

export function VariableTerm(
  tm: Syntax.VariableTerm,
  scope: Scope
): VariableTerm {
  const variable = tm.variable
  const ann = { ...tm.ann, scope }
  return Core.VariableTerm(variable, ann)
}

export function AssignmentTerm(
  tm: Syntax.AssignmentTerm,
  scope: Scope
): AssignmentTerm {
  const rhs = Term(tm.rhs, scope)
  const ann = { ...tm.ann, scope }
  return Core.AssignmentTerm(tm.lhs, rhs, ann)
}

export function LambdaTerm(tm: Syntax.LambdaTerm, scope: Scope): LambdaTerm {
  const args = tm.args
  const funcScope = new Scope(scope)
  args.forEach((arg) => funcScope.define(SymbolCS(arg, funcScope)))
  const body = Term(tm.body, funcScope)
  const ann = { ...tm.ann, scope }
  return Core.LambdaTerm(tm.args, body, ann)
}

export function CallTerm(tm: Syntax.CallTerm, scope: Scope): CallTerm {
  const func = Term(tm.func, scope)
  const args = tm.args.map((arg) => Term(arg, scope))
  const ann = { ...tm.ann, scope }
  return Core.CallTerm(func, args, ann)
}

export function LetTerm(tm: Syntax.LetTerm, scope: Scope): LetTerm {
  const letScope = new Scope(scope)
  const tmDecls = tm.declarations
  tmDecls.forEach((d) => letScope.define(SymbolCS(d.variable, letScope)))
  const declarations = tmDecls.map((d) => Declaration(d, letScope))
  const body = Term(tm.body, letScope)
  const ann = { ...tm.ann, scope }
  return Core.LetTerm(declarations, body, ann)
}

export function ParentheticalTerm(
  tm: Syntax.ParentheticalTerm,
  scope: Scope
): ParentheticalTerm {
  const term = Term(tm.term, scope)
  const ann = { ...tm.ann, scope }
  return Core.ParentheticalTerm(term, ann)
}

export function ArrayTerm(tm: Syntax.ArrayTerm, scope: Scope): ArrayTerm {
  const elements = tm.elements.map((e) => Term(e, scope))
  const ann = { ...tm.ann, scope }
  return Core.ArrayTerm(elements, ann)
}

export function ObjectTerm(tm: Syntax.ObjectTerm, scope: Scope): ObjectTerm {
  const entries = Object.entries(tm.entries).map(([n, t]) => [
    n,
    Term(t, scope)
  ])
  const ann = { ...tm.ann, scope }
  return Core.ObjectTerm(Object.fromEntries(entries), ann)
}

export function MemberAccessTerm(
  tm: Syntax.MemberAccessTerm,
  scope: Scope
): MemberAccessTerm {
  const object = Term(tm.object, scope)
  const ann = { ...tm.ann, scope }
  return Core.MemberAccessTerm(object, tm.member, ann)
}

export function IndexAccessTerm(
  tm: Syntax.IndexAccessTerm,
  scope: Scope
): IndexAccessTerm {
  const array = Term(tm.array, scope)
  const index = Term(tm.index, scope)
  const ann = { ...tm.ann, scope }
  return Core.IndexAccessTerm(array, index, ann)
}

export function DoTerm(tm: Syntax.DoTerm, scope: Scope): DoTerm {
  const block = BlockStatement(tm.block, scope)
  const ann = { ...tm.ann, scope }
  return Core.DoTerm(block, ann)
}

export function ConditionalTerm(
  tm: Syntax.ConditionalTerm,
  scope: Scope
): ConditionalTerm {
  const condition = Term(tm.condition, scope)
  const body = Term(tm.body, scope)
  const branch = BranchTerm(tm.branch, scope)
  const ann = { ...tm.ann, scope }
  return Core.ConditionalTerm(condition, body, branch, ann)
}

export function BranchTerm(tm: Syntax.BranchTerm, scope: Scope): BranchTerm {
  switch (tm.tag) {
    case 'ElifTerm':
      return ElifTerm(tm, scope)
    case 'ElseTerm':
      return ElseTerm(tm, scope)
  }
}

export function ElifTerm(tm: Syntax.ElifTerm, scope: Scope): ElifTerm {
  const condition = Term(tm.condition, scope)
  const body = Term(tm.body, scope)
  const branch = BranchTerm(tm.branch, scope)
  const ann = { ...tm.ann, scope }
  return Core.ElifTerm(condition, body, branch, ann)
}

export function ElseTerm(tm: Syntax.ElseTerm, scope: Scope): ElseTerm {
  const body = Term(tm.body, scope)
  const ann = { ...tm.ann, scope }
  return Core.ElseTerm(body, ann)
}

export function Statement(s: Syntax.Statement, scope: Scope) {
  switch (s.tag) {
    case 'AssignmentStatement':
      return AssignmentStatement(s, scope)
    case 'CallStatement':
      return CallStatement(s, scope)
    case 'ReturnStatement':
      return ReturnStatement(s, scope)
    case 'BlockStatement':
      return BlockStatement(s, scope)
    case 'IfStatement':
      return IfStatement(s, scope)
    case 'WhileStatement':
      return WhileStatement(s, scope)
    case 'DoWhileStatement':
      return DoWhileStatement(s, scope)
    case 'ForStatement':
      return ForStatement(s, scope)
  }
}

export function AssignmentStatement(
  s: Syntax.AssignmentStatement,
  scope: Scope
): AssignmentStatement {
  const rhs = Term(s.rhs, scope)
  const ann = { ...s.ann, scope }
  return Core.AssignmentStatement(s.lhs, rhs, ann)
}

export function CallStatement(
  s: Syntax.CallStatement,
  scope: Scope
): CallStatement {
  const func = Term(s.func, scope)
  const args = s.args.map((arg) => Term(arg, scope))
  const ann = { ...s.ann, scope }
  return Core.CallStatement(func, args, ann)
}

export function ReturnStatement(
  s: Syntax.ReturnStatement,
  scope: Scope
): ReturnStatement {
  const result = Term(s.result, scope)
  const ann = { ...s.ann, scope }
  return Core.ReturnStatement(result, ann)
}

export function BlockStatement(
  s: Syntax.BlockStatement,
  scope: Scope
): BlockStatement {
  const blockScope = new Scope(scope)
  const statements = s.statements.map((stmt) => Statement(stmt, blockScope))
  const ann = { ...s.ann, scope }
  return Core.BlockStatement(statements, ann)
}

export function IfStatement(s: Syntax.IfStatement, scope: Scope): IfStatement {
  const condition = Term(s.condition, scope)
  const body = Statement(s.body, scope)
  const branch = s.branch ? BranchStatement(s.branch, scope) : null
  const ann = { ...s.ann, scope }
  return Core.IfStatement(condition, body, branch, ann)
}

export function BranchStatement(
  s: Syntax.BranchStatement,
  scope: Scope
): BranchStatement {
  switch (s.tag) {
    case 'ElifStatement':
      return ElifStatement(s, scope)
    case 'ElseStatement':
      return ElseStatement(s, scope)
  }
}

export function ElifStatement(
  s: Syntax.ElifStatement,
  scope: Scope
): ElifStatement {
  const condition = Term(s.condition, scope)
  const body = Statement(s.body, scope)
  const branch = s.branch ? BranchStatement(s.branch, scope) : null
  const ann = { ...s.ann, scope }
  return Core.ElifStatement(condition, body, branch, ann)
}

export function ElseStatement(
  s: Syntax.ElseStatement,
  scope: Scope
): ElseStatement {
  const body = Statement(s.body, scope)
  const ann = { ...s.ann, scope }
  return Core.ElseStatement(body, ann)
}

export function WhileStatement(
  s: Syntax.WhileStatement,
  scope: Scope
): WhileStatement {
  const condition = Term(s.condition, scope)
  const body = Statement(s.body, scope)
  const ann = { ...s.ann, scope }
  return Core.WhileStatement(condition, body, ann)
}

export function DoWhileStatement(
  s: Syntax.DoWhileStatement,
  scope: Scope
): DoWhileStatement {
  const body = Statement(s.body, scope)
  const condition = Term(s.condition, scope)
  const ann = { ...s.ann, scope }
  return Core.DoWhileStatement(body, condition, ann)
}

export function ForStatement(
  s: Syntax.ForStatement,
  scope: Scope
): ForStatement {
  const forScope = new Scope(scope)
  const stmtDecls = s.declarations
  stmtDecls.forEach((d) => forScope.define(SymbolCS(d.variable, forScope)))
  const declarations = stmtDecls.map((d) => Declaration(d, forScope))
  const condition = Term(s.condition, forScope)
  const body = Statement(s.body, forScope)
  const update = Term(s.update, forScope)
  const ann = { ...s.ann, scope }
  return Core.ForStatement(declarations, condition, update, body, ann)
}
