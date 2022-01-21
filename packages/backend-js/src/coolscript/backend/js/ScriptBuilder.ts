import {
  AValue,
  Term,
  TermBlock,
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
  TmReturn,
  TmValue,
  TmVar,
  TmWhile
} from '@coolscript/syntax'
import { BlockBuilder } from './BlockBuilder'
import * as ES from 'estree'
import * as e from '../../../estree/constructors'

export class ScriptBuilder {
  block: BlockBuilder = new BlockBuilder()
  stack: Array<ES.Expression> = []

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
    this.visitTerm(term)
    const statements = this.block.build().body
    while (this.stack.length > 0) {
      const expression = this.stack.pop()
      const expressionStatement = e.ExpressionStatement(expression)
      statements.push(expressionStatement)
    }
    return e.Script(statements)
  }

  visitTerm(tm: Term) {
    switch (tm.tag) {
      case 'TmError':
        this.visitTmError(tm)
        break
      case 'TmValue':
        this.visitTmValue(tm)
        break
      case 'TmVar':
        this.visitTmVar(tm)
        break
      case 'TmAssign':
        this.visitTmAssign(tm)
        break
      case 'TmLam':
        this.visitTmLam(tm)
        break
      case 'TmReturn':
        this.visitTmReturn(tm)
        break
      case 'TmCall':
        this.visitTmCall(tm)
        break
      case 'TmParens':
        this.visitTmParens(tm)
        break
      case 'TmArray':
        this.visitTmArray(tm)
        break
      case 'TmObject':
        this.visitTmObject(tm)
        break
      case 'TmLet':
        this.visitTmLet(tm)
        break
      case 'TmDo':
        this.visitTmDo(tm)
        break
      case 'TmIf':
        this.visitTmIf(tm)
        break
      case 'TmWhile':
        this.visitTmWhile(tm)
        break
      case 'TmFor':
        this.visitTmFor(tm)
        break
      default:
        throw new Error(`Unknown term tag encountered: ${tm}`)
    }
  }

  visitTmError(tm: TmError) {
    const err = e.ThrowError(tm.msg)
    const errorClosure = e.ClosureExpression([err])
    this.stack.push(errorClosure)
  }

  visitTmValue(tm: TmValue) {
    const value = this.visitAValue(tm.value)
    this.stack.push(value)
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

  visitTmVar(tm: TmVar) {
    const v = e.Id(tm.variable)
    this.stack.push(v)
  }

  visitTmAssign(tm: TmAssign) {
    if (!this.block.resolve(tm.lhs)) {
      this.block.declareLet(tm.lhs)
    }
    this.visitTerm(tm.rhs)
    if (!this.stack) {
      throw new Error(
        `Expected right-hand side expression in assignment: ${tm}`
      )
    }
    const rhs: ES.Expression = this.stack.pop()
    const assignment = e.Assign(tm.lhs, rhs)
    this.stack.push(assignment)
  }

  visitTmLam(tm: TmLam) {
    const args = tm.args.map((arg) => e.Id(arg))
    this.enter(tm.args)
    this.visitTerm(tm.body)
    let body: ES.BlockStatement
    body = this.exit()
    if (body.body.length == 0) {
      const bodyExpression = this.stack.pop()
      const expressionStatement = e.ReturnStatement(bodyExpression)
      body = e.BlockStatement([expressionStatement])
    }
    const lambda = e.LambdaExpression(args, body)
    this.stack.push(lambda)
  }

  visitTmReturn(tm: TmReturn) {
    this.visitTerm(tm.result)
    const result = this.stack.pop()
    const returnStatement = e.ReturnStatement(result)
    this.block.append(returnStatement)
  }

  visitTmCall(tm: TmCall) {
    this.visitTerm(tm.caller)
    const f = this.stack.pop()
    const args = tm.args.map((arg) => {
      this.visitTerm(arg)
      return this.stack.pop()
    })
    const callExpression = e.CallExpression(f, args)
    this.stack.push(callExpression)
  }

  visitTmParens(tm: TmParens) {
    this.visitTerm(tm.term)
  }

  visitTmArray(tm: TmArray) {
    const elements = tm.elements.map((e) => {
      this.visitTerm(e)
      return this.stack.pop()
    })
    this.stack.push(e.ArrayExpression(elements))
  }

  visitTmObject(tm: TmObject) {
    const entries = Object.entries(tm.obj)
    const properties = entries.map(([name, val]) => {
      this.visitTerm(val)
      const value = this.stack.pop()
      return e.Property(name, value)
    })
    const objectExpression = e.ObjectExpression(properties)
    this.stack.push(objectExpression)
  }

  visitTmLet(tm: TmLet) {
    const resultVarId = this.freshen('result')
    this.block.declareLet(resultVarId)
    this.enter()
    tm.binders.forEach((b) => {
      this.visitTerm(b.body)
      const bindingBody = this.stack.pop()
      const declaration = e.Const(b.variable, bindingBody)
      this.block.append(declaration)
    })
    const body = tm.body
    if (body.tag == 'TmBlock') {
      this.visitTermBlock(body)
    } else {
      this.visitTerm(body)
    }
    const resultExp = this.stack.pop()
    if (resultExp) {
      const assignResult = e.ExpressionStatement(
        e.Assign(resultVarId, resultExp)
      )
      this.block.append(assignResult)
    }
    const blockStatement = this.exit()
    this.block.append(blockStatement)
    this.stack.push(e.Identifier(resultVarId))
  }

  visitTermBlock(block: TermBlock) {
    this.enter()
    let stmt
    let n = this.stack.length
    block.statements.forEach((s) => {
      this.visitTerm(s)
      if (this.stack.length > n) {
        stmt = e.ExpressionStatement(this.stack.pop())
        this.block.append(stmt)
      }
    })
    const blockStatement = this.exit()
    const closure = e.ClosureExpression(blockStatement.body)
    this.stack.push(closure)
  }

  visitTmDo(tm: TmDo) {
    this.visitTermBlock(tm.block)
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
}
