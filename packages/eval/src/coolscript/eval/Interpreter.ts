import {
  Binding,
  Branch,
  ElifBranch,
  TmArray,
  TmCall,
  TmDo,
  TmFor,
  TmIf,
  TmLet,
  TmObject,
  TmWhile,
  VArray,
  VBool,
  VObject
} from '@coolscript/syntax'
import { Term, TmAssign, Value, Var, VError, VLam } from '@coolscript/syntax'
import { MemorySpace } from './MemorySpace'
import { ReturnValue } from './ReturnValue'
import { Scope } from './Scope'
import { scopeTerm } from './ScopedTerm'

export class Interpreter {
  sharedReturnValue: ReturnValue = ReturnValue()
  rootScope: Scope // root space (filled by parser)
  globals: MemorySpace = new MemorySpace() // global memory
  currentSpace: MemorySpace = this.globals
  stack: MemorySpace[] = [] // call stack

  interpret(tm: Term): Value | null {
    this.rootScope = new Scope()
    const stm = scopeTerm(tm, this.rootScope)
    let result
    try {
      result = this.exec(stm)
    } catch (r) {
      return r as Value
    }
    return result
  }

  exec(tm: Term): Value | null {
    switch (tm.tag) {
      case 'TmError':
        return VError(tm.msg)
      case 'TmValue':
        return tm.value
      case 'TmVar':
        return this.load(tm.variable)
      case 'TmAssign':
        return this.assign(tm)
      case 'TmLam':
        return VLam(tm.args, tm.body)
      case 'TmReturn':
        this.ret(tm.result)
        break // return throws, so this should never execute
      case 'TmCall':
        return this.call(tm)
      case 'TmParens':
        return this.exec(tm.term)
      case 'TmArray':
        return this.makeArray(tm)
      case 'TmObject':
        return this.makeObject(tm)
      case 'TmLet':
        return this.execLet(tm)
      case 'TmDo':
        return this.execDo(tm)
      case 'TmIf':
        return this.execIf(tm)
      case 'TmWhile':
        return this.execWhile(tm)
      case 'TmFor':
        return this.execFor(tm)
      default:
        break
    }
    return null
  }

  load(id: Var): Value {
    const s: MemorySpace = this.getSpaceWithSymbol(id)
    if (s != null) {
      return s.get(id)
    }
    return VError(`No such variable "${id}".`)
  }

  assign(tm: TmAssign): Value {
    const value = this.exec(tm.rhs)
    let space: MemorySpace = this.getSpaceWithSymbol(tm.lhs)
    if (space == null) {
      space = this.currentSpace // create in current space
    }
    space.put(tm.lhs, value) // store
    return this.load(tm.lhs)
  }

  getSpaceWithSymbol(id: string): MemorySpace {
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

  ret(result: Term) {
    this.sharedReturnValue.value = this.exec(result)
    throw this.sharedReturnValue
  }

  call(tm: TmCall): Value {
    const fn = this.exec(tm.caller)
    if (fn.tag != 'VLam') {
      return VError(`Cannot call non-function: ${JSON.stringify(fn)}`)
    }
    const args = tm.args.map((x) => this.exec(x))

    // Create new memory space for stack.
    const fspace = new MemorySpace()
    const saveSpace = this.currentSpace
    this.currentSpace = fspace

    // Check for argument length mismatch
    const argCount = args.length
    if (argCount != fn.args.length) {
      return VError(`Function argument mismatch in call ${JSON.stringify(tm)}`)
    }
    // Define arguments in function space
    for (let i = 0; i < argCount; i++) {
      fspace.put(fn.args[i], args[i])
    }
    // Execute function body
    let result: Value = null
    this.stack.push(fspace)
    try {
      this.exec(fn.body)
    } catch (r) {
      // catch return values
      result = r.value
    }
    this.stack.pop()
    this.currentSpace = saveSpace
    return result
  }

  makeArray(tm: TmArray): Value {
    const elements = tm.elements.map((x) => this.exec(x))
    return VArray(elements)
  }

  makeObject(tm: TmObject): Value {
    const entries = Object.entries(tm.obj).map(([n, t]) => [n, this.exec(t)])
    const obj = Object.fromEntries(entries)
    return VObject(obj)
  }

  execLet(tm: TmLet): Value | null {
    // Create a new local memory space to bind too
    const localSpace = new MemorySpace()
    const saveSpace = this.currentSpace
    this.currentSpace = localSpace

    // Store bindings in new local memory space
    let binding: Binding
    let bindingBody: Value
    for (let i = 0; i < tm.binders.length; i++) {
      binding = tm.binders[i]
      bindingBody = this.exec(binding.body)
      localSpace.put(binding.variable, bindingBody)
    }

    let result: Value
    this.stack.push(localSpace)
    if (tm.body.tag == 'TmBlock') {
      result = this.block(tm.body.statements)
    } else {
      result = this.exec(tm.body)
    }
    this.stack.pop()

    return result
  }

  execDo(tm: TmDo): Value {
    return this.block(tm.block.statements)
  }

  execIf(tm: TmIf): Value {
    const pred: VBool = this.exec(tm.pred) as VBool
    if (pred.bool) {
      return this.exec(tm.body)
    }
    return this.branch(tm.branch)
  }

  branch(br: Branch): Value {
    switch (br.tag) {
      case 'Elif':
        return this.branchElif(br)
      case 'Else':
        return this.exec(br.body)
    }
  }

  branchElif(br: ElifBranch): Value {
    const pred: VBool = this.exec(br.pred) as VBool
    if (pred.bool) {
      return this.exec(br.body)
    }
    return this.branch(br.branch)
  }

  execWhile(tm: TmWhile): null {
    let pred: VBool = this.exec(tm.pred) as VBool
    while (pred) {
      this.exec(tm.body)
      pred = this.exec(tm.pred) as VBool
    }
    return null
  }

  execFor(tm: TmFor): null {
    this.exec(tm.init)
    let pred: VBool = this.exec(tm.pred) as VBool
    while (pred) {
      this.exec(tm.body)
      this.exec(tm.iter)
      pred = this.exec(tm.pred) as VBool
    }
    return null
  }

  block(statements: Term[]): Value | null {
    let stmt: Term
    for (let i = 0; i < statements.length; i++) {
      stmt = statements[i]
      try {
        this.exec(stmt)
      } catch (r) {
        return r
      }
    }
    return null
  }
}
