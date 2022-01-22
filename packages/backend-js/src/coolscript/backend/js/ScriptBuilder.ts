import {
  AValue,
  Term,
  TmAssign,
  TmCall,
  TmDo,
  TmError,
  TmIf,
  TmLam,
  TmLet,
  TmArray,
  TmObject,
  TmGet,
  TmGetI,
  TmParens,
  TmValue,
  TmVar,
  Statement,
  AssignmentStatement,
  CallStatement,
  ReturnStatement,
  BlockStatement,
  IfStatement,
  BranchStatement,
  ElifStatement,
  ElseStatement,
  WhileStatement,
  DoWhileStatement,
  ForStatement,
  Branch
} from '@coolscript/syntax'
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
      case 'TmError':
        return this.visitTmError(tm)
      case 'TmValue':
        return this.visitTmValue(tm)
      case 'TmVar':
        return this.visitTmVar(tm)
      case 'TmAssign':
        return this.visitTmAssign(tm)
      case 'TmLam':
        return this.visitTmLam(tm)
      case 'TmCall':
        return this.visitTmCall(tm)
      case 'TmParens':
        return this.visitTmParens(tm)
      case 'TmArray':
        return this.visitTmArray(tm)
      case 'TmObject':
        return this.visitTmObject(tm)
      case 'TmGet':
        return this.visitTmGet(tm)
      case 'TmGetI':
        return this.visitTmGetI(tm)
      case 'TmLet':
        return this.visitTmLet(tm)
      case 'TmDo':
        return this.visitTmDo(tm)
      case 'TmIf':
        return this.visitTmIf(tm)
      default:
        throw new Error(`Unknown term tag encountered: ${tm}`)
    }
  }

  visitTmError(tm: TmError): ES.Expression {
    const err = e.ThrowError(tm.msg)
    return e.ClosureExpression([err])
  }

  visitTmValue(tm: TmValue): ES.Literal {
    return this.visitAValue(tm.value)
  }

  visitAValue(v: AValue): ES.Literal {
    switch (v.tag) {
      case 'VNull':
        return e.Null()
      case 'VNumber':
        return e.Number(v.num)
      case 'VString':
        return e.Str(v.str)
      case 'VBool':
        return e.Bool(v.bool)
      default:
        throw new Error(`Unknown value tag encountered in: ${v}`)
    }
  }

  visitTmVar(tm: TmVar): ES.Identifier {
    return e.Id(tm.variable)
  }

  visitTmAssign(tm: TmAssign): ES.AssignmentExpression {
    const lhs = tm.lhs
    if (!this.block.resolve(lhs)) {
      this.block.declareLet(lhs)
    }
    const rhs: ES.Expression = this.visitTerm(tm.rhs)
    return e.Assign(lhs, rhs)
  }

  visitTmLam(tm: TmLam): ES.FunctionExpression {
    const args = tm.args.map((arg) => e.Id(arg))
    this.enter(tm.args)
    const body = this.visitTerm(tm.body)
    this.exit() // can safely ignore, only capabable of producing declarations for parameters
    const expressionStatement = e.ReturnStatement(body)
    const bodyBlock = e.BlockStatement([expressionStatement])
    return e.LambdaExpression(args, bodyBlock)
  }

  visitTmCall(tm: TmCall): ES.CallExpression {
    const f = this.visitTerm(tm.caller)
    const args = tm.args.map((arg) => {
      return this.visitTerm(arg)
    })
    return e.CallExpression(f, args)
  }

  visitTmParens(tm: TmParens): ES.Expression {
    return this.visitTerm(tm.term)
  }

  visitTmArray(tm: TmArray): ES.ArrayExpression {
    const elements = tm.elements.map((e) => {
      return this.visitTerm(e)
    })
    return e.ArrayExpression(elements)
  }

  visitTmObject(tm: TmObject): ES.ObjectExpression {
    const entries = Object.entries(tm.obj)
    const properties = entries.map(([name, val]) => {
      return e.Property(name, this.visitTerm(val))
    })
    return e.ObjectExpression(properties)
  }

  visitTmGet(tm: TmGet): ES.Expression {
    const object = this.visitTerm(tm.parent)
    const prop = e.Id(tm.child)
    return e.MemberExpression(object, prop)
  }

  visitTmGetI(tm: TmGetI): ES.Expression {
    const object = this.visitTerm(tm.parent)
    const index = this.visitTerm(tm.index)
    return e.MemberExpression(object, index)
  }

  visitTmLet(tm: TmLet): ES.Expression {
    this.enter()
    tm.binders.forEach((b) => {
      const bindingBody = this.visitTerm(b.body)
      this.block.declareConst(b.variable, bindingBody)
    })
    const body = this.visitTerm(tm.body)
    const decls = this.exit()
    const terminalExpression = e.ReturnStatement(body)
    return e.ClosureExpression([...decls.body, terminalExpression])
  }

  visitTmDo(tm: TmDo): ES.Expression {
    const { body } = this.visitBlockStatement(tm.block)
    return e.ClosureExpression(body)
  }

  visitTmIf(tm: TmIf): ES.ConditionalExpression {
    const test = this.visitTerm(tm.pred)
    const alternate = this.visitBranch(tm.branch)
    const consequent = this.visitTerm(tm.body)
    return e.ConditionalExpression(test, alternate, consequent)
  }

  visitBranch(br: Branch): ES.Expression {
    switch (br.tag) {
      case 'Elif':
        return this.visitTmIf(TmIf(br.pred, br.body, br.branch))
      case 'Else':
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
    if (!this.block.resolve(lhs)) {
      this.block.declareLet(lhs)
    }
    const rhs = this.visitTerm(s.rhs)
    const assignStatement = e.AssignStatement(lhs, rhs)
    this.block.append(assignStatement)
  }

  visitCallStatement(s: CallStatement) {
    const fn = this.visitTerm(s.fn)
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
    const test = this.visitTerm(s.pred)
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
        const sif = IfStatement(s.pred, s.body, s.branch)
        return this.visitIfStatement(sif)
      case 'ElseStatement':
        this.enter()
        this.visitStatement(s.body)
        return this.exit()
    }
  }

  visitWhileStatement(s: WhileStatement) {
    const test = this.visitTerm(s.pred)
    this.enter()
    this.visitStatement(s.body)
    const body = this.exit()
    const swhile = e.WhileStatement(test, body)
    this.block.append(swhile)
  }

  visitDoWhileStatement(s: DoWhileStatement) {
    const test = this.visitTerm(s.pred)
    this.enter()
    this.visitStatement(s.body)
    const body = this.exit()
    const sdowhile = e.DoWhileStatement(body, test)
    this.block.append(sdowhile)
  }

  visitForStatement(s: ForStatement) {
    const init = this.visitTerm(s.init)
    const test = this.visitTerm(s.pred)
    const update = this.visitTerm(s.iter)
    this.enter()
    this.visitStatement(s.body)
    const body = this.exit()
    const sfor = e.ForStatement(init, test, update, body)
    this.block.append(sfor)
  }
}
