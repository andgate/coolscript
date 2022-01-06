import {
  Term,
  Value,
  VError,
  TmError,
  VObject,
  TmObject,
  TmValue
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
    default:
      return TmError(`Unknown term tag encountered "${tm.tag}".`)
  }
}
