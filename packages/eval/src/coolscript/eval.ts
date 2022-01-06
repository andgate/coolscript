import { Term, Value, VError } from '@coolscript/syntax'

export function evalcs(tm: Term): Value | null {
  switch (tm.tag) {
    case 'TmValue':
      return tm.value
    default:
      return VError(`Unknown term tag encountered "${tm.tag}".`)
  }
}
