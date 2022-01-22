import {
  AValue,
  Term,
  TmArray,
  TmAssign,
  TmCall,
  TmDo,
  TmError,
  TmFor,
  TmIf,
  TmLam,
  TmLet,
  TmObject,
  TmParens,
  TmValue,
  TmVar,
  TmWhile,
  Statement,
  AssignmentStatement,
  CallStatement,
  ReturnStatement,
  BlockStatement
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
      case 'TmLet':
        return this.visitTmLet(tm)
      case 'TmDo':
        return this.visitTmDo(tm)
      case 'TmIf':
        return this.visitTmIf(tm)
      case 'TmWhile':
        return this.visitTmWhile(tm)
      case 'TmFor':
        return this.visitTmFor(tm)
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

  visitTmIf(tm: TmIf) {
    return e.Null()
  }

  visitTmWhile(tm: TmWhile) {
    return e.Null()
  }

  visitTmFor(tm: TmFor) {
    return e.Null()
  }

  visitStatement(s: Statement) {
    switch (s.tag) {
      case 'AssignmentStatement': {
        this.visitAssignmentStatement(s)
        break
      }
      case 'CallStatement': {
        this.vistCallStatement(s)
        break
      }
      case 'ReturnStatement': {
        this.vistReturnStatement(s)
        break
      }
      case 'BlockStatement': {
        const blockStatement = this.visitBlockStatement(s)
        this.block.append(blockStatement)
        break
      }
    }
  }

  visitAssignmentStatement(s: AssignmentStatement) {
    const lhs = s.lhs
    if (this.block.resolve(lhs)) {
      this.block.declareLet(lhs)
    }
    const rhs = this.visitTerm(s.rhs)
    const assignStatement = e.AssignStatement(lhs, rhs)
    this.block.append(assignStatement)
  }

  vistCallStatement(s: CallStatement) {
    const fn = this.visitTerm(s.fn)
    const args = s.args.map((arg) => this.visitTerm(arg))
    const callStatement = e.CallStatement(fn, args)
    this.block.append(callStatement)
  }

  vistReturnStatement(s: ReturnStatement) {
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
}
