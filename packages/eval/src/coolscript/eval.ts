import {
  Term,
  Value,
  VError,
  TmError,
  VObject,
  TmObject,
  TmValue,
  DoStatement,
  TmNull
} from '@coolscript/syntax'

type EvalEnv = { [key: string]: Term }

export function evaluate(tm: Term): Value {
  const result = reduce(tm)
  if (result.tag != 'TmValue') {
    const msg = `Irreducible expression encountered: ${JSON.stringify(result)}`
    return VError(msg)
  }
  return result.value
}

export function reduce(tm: Term, env: EvalEnv = {}): Term {
  if (!tm) {
    const msg = `Term undefined: ${tm}`
    return TmError(msg)
  }

  switch (tm.tag) {
    case 'TmVar': {
      const t = env[tm.variable]
      if (!t) {
        return TmError(`Undefined variable encountered: "${tm.tag}".`)
      }
      return reduce(t, env)
    }
    case 'TmValue':
      return tm
    case 'TmLam':
      return tm
    case 'TmCall': {
      const f = reduce(tm.call.caller, env)
      const xs = tm.call.args.map((x) => reduce(x, env))

      if (f.tag != 'TmLam') {
        const msg = `Non-function encountered in application head: ${JSON.stringify(
          tm
        )}`
        return TmError(msg)
      }

      if (xs.length == 0) {
        return reduce(f, env)
      }

      const lam = f.lam
      const args = lam.args
      if (xs.length != args.length) {
        return TmError(`Incorrect number of arguments: ${tm}`)
      }

      const env2 = Object.fromEntries(args.map((v, i) => [v, xs[i]]))
      return reduce(lam.body, { ...env, ...env2 })
    }
    case 'TmLet': {
      const defs = Object.fromEntries(
        tm.let.binders.map((b) => [b.variable, b.body])
      )
      return reduce(tm.let.body, { ...env, ...defs })
    }
    case 'TmObject': {
      const obj = {}
      let isValue = true
      for (const [k, t1] of Object.entries(tm.obj)) {
        const t2 = reduce(t1, env)
        isValue &&= t2.tag == 'TmValue'
        obj[k] = t2
      }
      if (isValue) {
        for (const [k, t] of Object.entries(obj)) {
          obj[k] = (t as TmValue).value
        }
        return TmValue(VObject(obj))
      }
      return TmObject(obj)
    }
    case 'TmDo': {
      return executeStatements(tm.do.statements, env)
    }
    default:
      return TmError(`Unknown term tag encountered "${tm.tag}".`)
  }
}

type ExecutionEnv = {
  env: EvalEnv
  result: Term | null
}

const ExecutionEnv = (env: EvalEnv, result: Term | null = null) => ({
  env,
  result
})

function executeStatements(stmts: DoStatement[], env: EvalEnv): Term {
  let exe: ExecutionEnv = ExecutionEnv(env)
  for (let i = 0; i <= stmts.length; i++) {
    exe = executeStatement(stmts[i], exe)
    if (exe.result) {
      return exe.result
    }
  }
  return TmNull
}

function executeStatement(stmt: DoStatement, exe: ExecutionEnv): ExecutionEnv {
  switch (stmt.tag) {
    case 'DoBind': {
      const env = { ...exe.env }
      const bind = stmt.bind
      const v = bind.lhs
      env[v] = reduce(bind.rhs, env)
      return ExecutionEnv(env)
    }
    case 'DoCommand': {
      const term = stmt.command.term
      reduce(term, exe.env)
      return ExecutionEnv(exe.env)
    }
    case 'DoReturn': {
      const term = stmt.return.term
      const result = reduce(term, exe.env)
      return ExecutionEnv(exe.env, result)
    }
    default:
      return {
        env: exe.env,
        result: TmError(`Unrecognized statement: ${JSON.stringify(stmt)}`)
      }
  }
}
