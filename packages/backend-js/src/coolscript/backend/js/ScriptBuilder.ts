import {
  AtomicValue,
  Term,
  AssignmentTerm,
  CallTerm,
  DoTerm,
  ErrorTerm,
  ConditionalTerm,
  BranchTerm,
  LambdaTerm,
  LetTerm,
  ArrayTerm,
  ObjectTerm,
  MemberAccessTerm,
  IndexAccessTerm,
  ParentheticalTerm,
  ValueTerm,
  VariableTerm,
  Statement,
  AssignmentStatement,
  CallStatement,
  ReturnStatement,
  BlockStatement,
  IfStatement,
  BranchStatement,
  WhileStatement,
  DoWhileStatement,
  ForStatement,
  VariableDeclaration
} from '@coolscript/syntax-concrete'
import * as Core from '@coolscript/syntax'
import { BlockBuilder } from './BlockBuilder'
import * as ES from 'estree'
import * as e from '../../../estree/constructors'

export class ScriptBuilder {
  block: BlockBuilder = new BlockBuilder()

  enter(params: Array<string> = []) {
    this.block = new BlockBuilder(params, this.block)
  }

  exit(): ES.BlockStatement {
    const parent = this.block.parent
    if (!parent) return

    const blockStatement = this.block.build()
    this.block = parent
    return blockStatement
  }

  freshen(id: string): string {
    let freshId = id
    let fresh = 0
    while (this.block.resolve(freshId)) {
      freshId = `${id}_${fresh++}`
    }
    return freshId
  }

  generate(term: Term): ES.Program {
    const terminalExpression = this.visitTerm(term)
    const statements = this.block.build().body
    const terminalStatement = e.ExpressionStatement(terminalExpression)
    statements.push(terminalStatement)
    return e.Script(statements)
  }

  visitTerm(tm: Term): ES.Expression {
    switch (tm.tag) {
      case 'ErrorTerm':
        return this.visitErrorTerm(tm)
      case 'ValueTerm':
        return this.visitValueTerm(tm)
      case 'VariableTerm':
        return this.visitVariableTerm(tm)
      case 'AssignmentTerm':
        return this.visitAssignmentTerm(tm)
      case 'LambdaTerm':
        return this.visitLambdaTerm(tm)
      case 'CallTerm':
        return this.visitCallTerm(tm)
      case 'ParentheticalTerm':
        return this.visitParentheticalTerm(tm)
      case 'ArrayTerm':
        return this.visitArrayTerm(tm)
      case 'ObjectTerm':
        return this.visitObjectTerm(tm)
      case 'MemberAccessTerm':
        return this.visitMemberAccessTerm(tm)
      case 'IndexAccessTerm':
        return this.visitIndexAccessTerm(tm)
      case 'LetTerm':
        return this.visitLetTerm(tm)
      case 'DoTerm':
        return this.visitDoTerm(tm)
      case 'ConditionalTerm':
        return this.visitConditionalTerm(tm)
      default:
        throw new Error(`Unknown term tag encountered: ${tm}`)
    }
  }

  visitErrorTerm(tm: ErrorTerm): ES.Expression {
    const err = e.ThrowError(tm.msg)
    return e.ClosureExpression([err])
  }

  visitValueTerm(tm: ValueTerm): ES.Literal {
    return this.visitAtomicValue(tm.value)
  }

  visitAtomicValue(v: AtomicValue): ES.Literal {
    switch (v.tag) {
      case 'NullValue':
        return e.Null()
      case 'NumberValue':
        return e.Number(v.num)
      case 'StringValue':
        return e.Str(v.str)
      case 'BooleanValue':
        return e.Bool(v.bool)
      default:
        throw new Error(`Unknown value tag encountered in: ${v}`)
    }
  }

  visitVariableTerm(tm: VariableTerm): ES.Identifier {
    return e.Id(tm.variable)
  }

  visitAssignmentTerm(tm: AssignmentTerm): ES.AssignmentExpression {
    const lhs = tm.lhs
    if (!this.block.resolve(lhs)) {
      this.block.declareLet(lhs)
    }
    const rhs: ES.Expression = this.visitTerm(tm.rhs)
    return e.Assign(lhs, rhs)
  }

  visitLambdaTerm(tm: LambdaTerm): ES.FunctionExpression {
    const args = tm.args.map((arg) => e.Id(arg))
    this.enter(tm.args)
    const body = this.visitTerm(tm.body)
    this.exit() // can safely ignore, only capabable of producing declarations for parameters
    const expressionStatement = e.ReturnStatement(body)
    const bodyBlock = e.BlockStatement([expressionStatement])
    return e.LambdaExpression(args, bodyBlock)
  }

  visitCallTerm(tm: CallTerm): ES.CallExpression {
    const f = this.visitTerm(tm.func)
    const args = tm.args.map((arg) => {
      return this.visitTerm(arg)
    })
    return e.CallExpression(f, args)
  }

  visitParentheticalTerm(tm: ParentheticalTerm): ES.Expression {
    return this.visitTerm(tm.term)
  }

  visitArrayTerm(tm: ArrayTerm): ES.ArrayExpression {
    const elements = tm.elements.map((e) => {
      return this.visitTerm(e)
    })
    return e.ArrayExpression(elements)
  }

  visitObjectTerm(tm: ObjectTerm): ES.ObjectExpression {
    const entries = Object.entries(tm.entries)
    const properties = entries.map(([name, val]) => {
      return e.Property(name, this.visitTerm(val))
    })
    return e.ObjectExpression(properties)
  }

  visitMemberAccessTerm(tm: MemberAccessTerm): ES.Expression {
    const object = this.visitTerm(tm.object)
    const prop = e.Id(tm.member)
    return e.MemberExpression(object, prop)
  }

  visitIndexAccessTerm(tm: IndexAccessTerm): ES.Expression {
    const object = this.visitTerm(tm.array)
    const index = this.visitTerm(tm.index)
    return e.MemberExpression(object, index)
  }

  visitLetTerm(tm: LetTerm): ES.Expression {
    this.enter()
    tm.declarations.forEach((d) => {
      const declBody = this.visitTerm(d.body)
      this.block.declareConst(d.variable, declBody)
    })
    const body = this.visitTerm(tm.body)
    const decls = this.exit()
    const terminalExpression = e.ReturnStatement(body)
    return e.ClosureExpression([...decls.body, terminalExpression])
  }

  visitDoTerm(tm: DoTerm): ES.Expression {
    const { body } = this.visitBlockStatement(tm.block)
    return e.ClosureExpression(body)
  }

  visitConditionalTerm(tm: ConditionalTerm): ES.ConditionalExpression {
    const test = this.visitTerm(tm.condition)
    const alternate = this.visitBranchTerm(tm.branch)
    const consequent = this.visitTerm(tm.body)
    return e.ConditionalExpression(test, alternate, consequent)
  }

  visitBranchTerm(br: BranchTerm): ES.Expression {
    switch (br.tag) {
      case 'ElifTerm':
        const conditional = Core.ConditionalTerm(
          br.condition,
          br.body,
          br.branch,
          br.ann
        )
        return this.visitConditionalTerm(conditional)
      case 'ElseTerm':
        return this.visitTerm(br.body)
    }
  }

  visitStatement(s: Statement) {
    switch (s.tag) {
      case 'AssignmentStatement': {
        this.visitAssignmentStatement(s)
        break
      }
      case 'CallStatement': {
        this.visitCallStatement(s)
        break
      }
      case 'ReturnStatement': {
        this.visitReturnStatement(s)
        break
      }
      case 'BlockStatement': {
        const blockStatement = this.visitBlockStatement(s)
        this.block.append(blockStatement)
        break
      }
      case 'IfStatement': {
        const sif = this.visitIfStatement(s)
        this.block.append(sif)
        break
      }
      case 'WhileStatement': {
        this.visitWhileStatement(s)
        break
      }
      case 'DoWhileStatement': {
        this.visitDoWhileStatement(s)
        break
      }
      case 'ForStatement': {
        this.visitForStatement(s)
        break
      }
    }
  }

  visitAssignmentStatement(s: AssignmentStatement) {
    const lhs = s.lhs
    const rhs = this.visitTerm(s.rhs)
    if (!this.block.resolve(lhs)) {
      this.block.declareLet(lhs, rhs)
      return
    }
    const assignStatement = e.AssignStatement(lhs, rhs)
    this.block.append(assignStatement)
  }

  visitCallStatement(s: CallStatement) {
    const fn = this.visitTerm(s.func)
    const args = s.args.map((arg) => this.visitTerm(arg))
    const callStatement = e.CallStatement(fn, args)
    this.block.append(callStatement)
  }

  visitReturnStatement(s: ReturnStatement) {
    const result = this.visitTerm(s.result)
    const returnStatement = e.ReturnStatement(result)
    this.block.append(returnStatement)
  }

  visitBlockStatement(s: BlockStatement): ES.BlockStatement {
    this.enter()
    s.statements.forEach((s) => {
      this.visitStatement(s)
    })
    return this.exit()
  }

  visitIfStatement(s: IfStatement) {
    const test = this.visitTerm(s.condition)
    this.enter()
    this.visitStatement(s.body)
    const consequent = this.exit()
    let alternate = null
    if (s.branch) {
      alternate = this.visitBranchStatement(s.branch)
    }
    const sif = e.IfStatement(test, consequent, alternate)
    return sif
  }

  visitBranchStatement(s: BranchStatement): ES.Statement {
    switch (s.tag) {
      case 'ElifStatement':
        const sif = Core.IfStatement(s.condition, s.body, s.branch, s.ann)
        return this.visitIfStatement(sif)
      case 'ElseStatement':
        this.enter()
        this.visitStatement(s.body)
        return this.exit()
    }
  }

  visitWhileStatement(s: WhileStatement) {
    const test = this.visitTerm(s.condition)
    this.enter()
    this.visitStatement(s.body)
    const body = this.exit()
    const swhile = e.WhileStatement(test, body)
    this.block.append(swhile)
  }

  visitDoWhileStatement(s: DoWhileStatement) {
    const test = this.visitTerm(s.condition)
    this.enter()
    this.visitStatement(s.body)
    const body = this.exit()
    const sdowhile = e.DoWhileStatement(body, test)
    this.block.append(sdowhile)
  }

  visitForStatement(s: ForStatement) {
    s.declarations.forEach((d) => {
      const body = this.visitTerm(d.body)
      this.block.declareLet(d.variable, body)
    })
    const test = this.visitTerm(s.condition)
    const update = this.visitTerm(s.update)
    this.enter()
    this.visitStatement(s.body)
    const body = this.exit()
    const sfor = e.ForStatement(null, test, update, body)
    this.block.append(sfor)
  }

  visitVariableDeclaration(d: VariableDeclaration): ES.VariableDeclaration {
    const body = this.visitTerm(d.body)
    return e.Let(d.variable, body)
  }
}
