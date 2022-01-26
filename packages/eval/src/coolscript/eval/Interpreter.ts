import {
  scopeTerm,
  Scope,
  Term,
  AssignmentTerm,
  CallTerm,
  DoTerm,
  ConditionalTerm,
  BranchTerm,
  ElifTerm,
  LetTerm,
  ArrayTerm,
  ObjectTerm,
  MemberAccessTerm,
  IndexAccessTerm,
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
  Variable,
  Declaration
} from '@coolscript/syntax-scoped'
import * as Core from '@coolscript/syntax'
import * as Concrete from '@coolscript/syntax-concrete'
import * as V from './Value'
import { MemorySpace } from './MemorySpace'

export class Interpreter {
  rootScope: Scope // root space (filled by parser)
  globals: MemorySpace = new MemorySpace() // global memory
  currentSpace: MemorySpace = this.globals
  stack: MemorySpace[] = [this.currentSpace] // call stack

  interpret(tm: Concrete.Term): V.Value | null {
    this.rootScope = new Scope()
    const stm = scopeTerm(tm, this.rootScope)
    let result
    try {
      result = this.exec(stm)
    } catch (r) {
      return r as V.Value
    }
    return result
  }

  exec(tm: Term): V.Value | null {
    switch (tm.tag) {
      case 'ErrorTerm':
        return V.ErrorValue(tm.msg)
      case 'ValueTerm':
        return tm.value
      case 'VariableTerm':
        return this.loadVariable(tm.variable)
      case 'AssignmentTerm':
        return this.execAssignmentTerm(tm)
      case 'LambdaTerm':
        return V.LambdaValue(tm.args, tm.body) // TODO store closure
      case 'CallTerm':
        return this.execCallTerm(tm)
      case 'ParentheticalTerm':
        return this.exec(tm.term)
      case 'ArrayTerm':
        return this.execArrayTerm(tm)
      case 'ObjectTerm':
        return this.execObjectTerm(tm)
      case 'MemberAccessTerm':
        return this.execMemberAccessTerm(tm)
      case 'IndexAccessTerm':
        return this.execIndexAccessTerm(tm)
      case 'LetTerm':
        return this.execLetTerm(tm)
      case 'DoTerm':
        return this.execDoTerm(tm)
      case 'ConditionalTerm':
        return this.execConditionalTerm(tm)
      default:
        break
    }
    return null
  }

  loadVariable(id: Variable): V.Value {
    const s: MemorySpace = this.getSpaceWithSymbol(id)
    if (s != null) {
      return s.get(id)
    }
    return V.ErrorValue(`No such variable "${id}".`)
  }

  execAssignmentTerm(tm: AssignmentTerm): V.Value {
    const value = this.exec(tm.rhs)
    let space: MemorySpace = this.getSpaceWithSymbol(tm.lhs)
    if (space == null) {
      space = this.currentSpace // create in current space
    }
    space.put(tm.lhs, value) // store
    return this.loadVariable(tm.lhs)
  }

  getSpaceWithSymbol(id: string): MemorySpace | null {
    // On top of the stack?
    const top = this.stack.length - 1
    if (this.stack.length > 0 && this.stack[top].get(id) != null) {
      return this.stack[top]
    }
    // in globals?
    if (this.globals.get(id) != null) {
      return this.globals
    }
    return null // nowhere
  }

  execCallTerm(tm: CallTerm): V.Value {
    const fn = this.exec(tm.func)
    if (fn.tag != 'LambdaValue') {
      return V.ErrorValue(`Cannot call non-function: ${JSON.stringify(fn)}`)
    }
    const args = tm.args.map((x) => this.exec(x))

    // Create new memory space for stack.
    const fspace = new MemorySpace()
    const saveSpace = this.currentSpace
    this.currentSpace = fspace

    // Check for argument length mismatch
    const argCount = args.length
    if (argCount != fn.args.length) {
      return V.ErrorValue(
        `Function argument mismatch in call ${JSON.stringify(tm)}`
      )
    }
    // Define arguments in function space
    for (let i = 0; i < argCount; i++) {
      fspace.put(fn.args[i], args[i])
    }
    // Execute function body
    let result: V.Value = null
    this.stack.push(fspace)
    try {
      result = this.exec(fn.body)
    } catch (r) {
      // catch return values
      result = r.value
    }
    this.stack.pop()
    this.currentSpace = saveSpace
    return result
  }

  execArrayTerm(tm: ArrayTerm): V.Value {
    const elements = tm.elements.map((x) => this.exec(x))
    return V.ArrayValue(elements)
  }

  execObjectTerm(tm: ObjectTerm): V.Value {
    const entries = Object.entries(tm.entries).map(([n, t]) => [
      n,
      this.exec(t)
    ])
    const obj = Object.fromEntries(entries)
    return V.ObjectValue(obj)
  }

  execMemberAccessTerm(tm: MemberAccessTerm): V.Value {
    const parentValue = this.exec(tm.object) as V.ObjectValue
    return parentValue.entries[tm.member] || V.NullValue()
  }

  execIndexAccessTerm(tm: IndexAccessTerm): V.Value {
    const parentValue = this.exec(tm.array) as V.ArrayValue
    const indexValue = this.exec(tm.index) as V.NumberValue
    return parentValue.elements[indexValue.num] || V.NullValue()
  }

  execLetTerm(tm: LetTerm): V.Value | null {
    // Create a new local memory space to bind too
    const localSpace = new MemorySpace()
    const saveSpace = this.currentSpace
    this.currentSpace = localSpace

    // Store bindings in new local memory space
    let decl: Declaration
    let declBody: V.Value
    for (let i = 0; i < tm.declarations.length; i++) {
      decl = tm.declarations[i]
      declBody = this.exec(decl.body)
      localSpace.put(decl.variable, declBody)
    }

    let result: V.Value
    this.stack.push(localSpace)
    result = this.exec(tm.body)
    this.stack.pop()
    this.currentSpace = saveSpace

    return result
  }

  execDoTerm(tm: DoTerm): V.Value {
    try {
      this.execBlockStatement(tm.block)
    } catch (r) {
      return r
    }
    return V.NullValue()
  }

  execConditionalTerm(tm: ConditionalTerm): V.Value {
    const cond: V.BooleanValue = this.exec(tm.condition) as V.BooleanValue
    if (cond.bool) {
      return this.exec(tm.body)
    }
    return this.execBranchTerm(tm.branch)
  }

  execBranchTerm(br: BranchTerm): V.Value {
    switch (br.tag) {
      case 'ElifTerm':
        return this.execElifTerm(br)
      case 'ElseTerm':
        return this.exec(br.body)
    }
  }

  execElifTerm(tm: ElifTerm): V.Value {
    const cond: V.BooleanValue = this.exec(tm.condition) as V.BooleanValue
    if (cond.bool) {
      return this.exec(tm.body)
    }
    return this.execBranchTerm(tm.branch)
  }

  execStatement(s: Statement) {
    switch (s.tag) {
      case 'AssignmentStatement': {
        this.execAssignmentStatement(s)
        break
      }
      case 'CallStatement': {
        this.execCallStatement(s)
        break
      }
      case 'ReturnStatement': {
        this.execReturnStatement(s)
        break
      }
      case 'BlockStatement': {
        this.execBlockStatement(s)
        break
      }
      case 'IfStatement': {
        this.execIfStatement(s)
        break
      }
      case 'WhileStatement': {
        this.execWhileStatement(s)
        break
      }
      case 'DoWhileStatement': {
        this.execDoWhileStatement(s)
        break
      }
      case 'ForStatement': {
        this.execForStatement(s)
        break
      }
      default: {
        break
      }
    }
  }

  execAssignmentStatement(s: AssignmentStatement) {
    this.execAssignmentTerm(Core.AssignmentTerm(s.lhs, s.rhs, s.ann))
  }

  execCallStatement(s: CallStatement) {
    this.execCallTerm(Core.CallTerm(s.func, s.args, s.ann))
  }

  execReturnStatement(s: ReturnStatement) {
    const result = this.exec(s.result)
    this.stack.pop()
    throw result
  }

  execBlockStatement(block: BlockStatement) {
    block.statements.forEach((s) => {
      this.execStatement(s)
    })
  }

  execIfStatement(s: IfStatement) {
    const cond: V.BooleanValue = this.exec(s.condition) as V.BooleanValue
    if (cond.bool) {
      return this.execStatement(s.body)
    }
    return this.execBranchStatement(s.branch)
  }

  execBranchStatement(br: BranchStatement) {
    switch (br.tag) {
      case 'ElifStatement':
        return this.execIfStatement(
          Core.IfStatement(br.condition, br.body, br.branch, br.ann)
        )
      case 'ElseStatement':
        return this.execStatement(br.body)
    }
  }

  execWhileStatement(s: WhileStatement) {
    let cond: V.BooleanValue = this.exec(s.condition) as V.BooleanValue
    while (cond) {
      this.execStatement(s.body)
      cond = this.exec(s.condition) as V.BooleanValue
    }
    return null
  }

  execDoWhileStatement(s: DoWhileStatement) {
    let cond: V.BooleanValue
    do {
      this.execStatement(s.body)
      cond = this.exec(s.condition) as V.BooleanValue
    } while (cond)
    return null
  }

  execForStatement(tm: ForStatement) {
    tm.declarations.forEach((d) =>
      this.execAssignmentTerm(Core.AssignmentTerm(d.variable, d.body, d.ann))
    )
    let cond: V.BooleanValue = this.exec(tm.condition) as V.BooleanValue
    while (cond) {
      this.execStatement(tm.body)
      this.exec(tm.update)
      cond = this.exec(tm.condition) as V.BooleanValue
    }
    return null
  }
}
