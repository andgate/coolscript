import * as ES from 'estree'
import * as e from '../../../estree/constructors'

export class BlockBuilder {
  parent: BlockBuilder | null
  locals: Set<string> = new Set()
  declarations: ES.Declaration[] = []
  statements: ES.Statement[] = []

  constructor(params: Array<string> = [], parent: BlockBuilder | null = null) {
    this.parent = parent
    params.forEach((x) => this.locals.add(x))
  }

  declareLet(lhs: string, rhs?: ES.Expression) {
    if (this.isLocal(lhs)) return
    this.locals.add(lhs)
    this.declarations.push(e.Let(lhs, rhs))
  }

  declareConst(rhs: string, lhs: ES.Expression) {
    if (this.isLocal(rhs)) return
    this.locals.add(rhs)
    this.declarations.push(e.Const(rhs, lhs))
  }

  isLocal(id: string): boolean {
    return this.locals.has(id)
  }

  isGlobal(id: string): boolean {
    return this.parent && this.parent.isLocal(id)
  }

  isDefined(id: string): boolean {
    return this.isLocal(id) || this.isGlobal(id)
  }

  append(statement: ES.Statement) {
    this.statements.push(statement)
  }

  build(): ES.BlockStatement {
    return e.BlockStatement([...this.declarations, ...this.statements])
  }
}
