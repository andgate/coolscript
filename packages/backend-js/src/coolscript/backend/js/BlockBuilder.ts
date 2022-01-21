import * as ES from 'estree'
import * as e from '../../../estree/constructors'

export class BlockBuilder {
  declarations: ES.Declaration[]
  statements: ES.Statement[]

  declare(declaration: ES.Declaration) {
    this.declarations.push(declaration)
  }

  append(statement: ES.Statement) {
    this.statements.push(statement)
  }

  build(): ES.BlockStatement {
    return e.BlockStatement([...this.declarations, ...this.statements])
  }
}
