import {
  ScopeBuilder,
  Scope,
  Term,
  AssignmentTerm,
  LambdaTerm,
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
  Declaration
} from '@coolscript/syntax'
import { MemoryManager } from './MemoryManager'
import * as V from './heap/HeapValue'

export class Interpreter {
  memory: MemoryManager = new MemoryManager()

  interpret(tm: Concrete.Term): V.HeapValue | null {
    const stm = scopeTerm(tm, new Scope())
    let result
    try {
      result = this.exec(stm)
    } catch (r) {
      result = r as V.HeapValue
    }
    return result
  }

  exec(tm: Term): V.HeapValue | null {
    switch (tm.tag) {
      case 'ErrorTerm':
        return V.ErrorValue(tm.msg)
      case 'ValueTerm':
        return tm.value
      case 'VariableTerm':
        return this.memory.load(tm.variable)
      case 'AssignmentTerm':
        return this.execAssignmentTerm(tm)
      case 'LambdaTerm':
        return this.execLambdaTerm(tm)
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

  execAssignmentTerm(tm: AssignmentTerm): V.HeapValue {
    const value = this.exec(tm.rhs)
    const heapId = this.memory.store(tm.lhs, value)
    return V.ReferenceValue(heapId)
  }

  execLambdaTerm(tm: LambdaTerm): V.HeapValue {
    // need to get free variables from tm.body,
    const fvs = getFreeVars(tm.body, new Set())
    const closure: V.HeapClosure = fvs.map((v) => [v, this.memory.resolve(v)])
    return V.LambdaValue(closure, tm.args, tm.body)
  }

  execCallTerm(tm: CallTerm): V.HeapValue {
    // Execute function head
    const fn = this.exec(tm.func)
    if (fn.tag != 'LambdaValue') {
      return V.ErrorValue(`Cannot call non-function: ${JSON.stringify(fn)}`)
    }

    // Execute arguments
    const args = tm.args.map((x) => this.exec(x))

    // Check for argument length mismatch
    const argCount = args.length
    if (argCount != fn.args.length) {
      return V.ErrorValue(
        `Function argument mismatch in call ${JSON.stringify(tm)}`
      )
    }

    // Create new root scope.
    this.memory.pushScope()

    // Define arguments in new root scope space
    for (let i = 0; i < argCount; i++) {
      this.memory.store(fn.args[i], args[i])
    }

    // Execute function body
    let result: V.HeapValue = null
    try {
      result = this.exec(fn.body)
    } catch (r) {
      // catch return values
      result = r.value
    }
    this.memory.popScope()
    return result
  }

  execArrayTerm(tm: ArrayTerm): V.HeapValue {
    const elements = tm.elements.map((x) => this.exec(x))
    return V.ArrayValue(elements)
  }

  execObjectTerm(tm: ObjectTerm): V.HeapValue {
    const entries = Object.entries(tm.entries).map(([n, t]) => [
      n,
      this.exec(t)
    ])
    const obj = Object.fromEntries(entries)
    return V.ObjectValue(obj)
  }

  execMemberAccessTerm(tm: MemberAccessTerm): V.HeapValue {
    const parentValue = this.exec(tm.object) as V.ObjectValue
    return parentValue.entries[tm.member] || V.NullValue()
  }

  execIndexAccessTerm(tm: IndexAccessTerm): V.HeapValue {
    const parentValue = this.exec(tm.array) as V.ArrayValue
    const indexValue = this.exec(tm.index) as V.NumberValue
    return parentValue.elements[indexValue.num] || V.NullValue()
  }

  execLetTerm(tm: LetTerm): V.HeapValue | null {
    // Create a new local memory space to bind too
    this.memory.enterScope()

    // Store bindings in new local memory space
    let decl: Declaration
    let declBody: V.HeapValue
    for (let i = 0; i < tm.declarations.length; i++) {
      decl = tm.declarations[i]
      declBody = this.exec(decl.body)
      this.memory.store(decl.variable, declBody)
    }

    const result: V.HeapValue = this.exec(tm.body)
    this.memory.exitScope()
    return result
  }

  execDoTerm(tm: DoTerm): V.HeapValue {
    try {
      this.execBlockStatement(tm.block)
    } catch (r) {
      return r
    }
    return V.NullValue()
  }

  execConditionalTerm(tm: ConditionalTerm): V.HeapValue {
    const cond: V.BooleanValue = this.exec(tm.condition) as V.BooleanValue
    if (cond.bool) {
      return this.exec(tm.body)
    }
    return this.execBranchTerm(tm.branch)
  }

  execBranchTerm(br: BranchTerm): V.HeapValue {
    switch (br.tag) {
      case 'ElifTerm':
        return this.execElifTerm(br)
      case 'ElseTerm':
        return this.exec(br.body)
    }
  }

  execElifTerm(tm: ElifTerm): V.HeapValue {
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
    this.memory.popScope()
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

  loadTerm(value: V.HeapValue): Core.Term<unknown> {
    switch (value.tag) {
      case 'NullValue':
      case 'BooleanValue':
      case 'NumberValue':
      case 'StringValue':
        return Core.ValueTerm(value, {})
      case 'ReferenceValue':
        throw new Error('Unimplemented!')
      case 'ArrayValue': {
        const elements = value.elements.map((v) => this.loadTerm(v))
        return Core.ArrayTerm(elements, {})
      }
      case 'ObjectValue': {
        const entries = Object.entries(value.entries).map(([k, v]) => [
          k,
          this.loadTerm(v)
        ])
        const objectMap = Object.fromEntries(entries)
        return Core.ObjectTerm(objectMap, {})
      }
      case 'LambdaValue': {
        const args = value.args
        const body: Core.Term<unknown> = value.body as Core.Term<unknown>
        return Core.LambdaTerm(args, body, {})
      }
      case 'ErrorValue':
        return Core.ErrorTerm(value.err, {})
    }
  }
}
