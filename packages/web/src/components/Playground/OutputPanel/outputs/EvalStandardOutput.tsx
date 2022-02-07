import { useMemo } from 'react'
import ReactJson from 'react-json-view'
import { EvalResult, evaluate } from '@coolscript/eval'
import { usePlaygroundStore } from '../../PlaygroundContext'
import { ErrorOutput } from './ErrorOutput'

export function EvalStandardOutput() {
  const { scriptText } = usePlaygroundStore()
  const result: EvalResult | null = useMemo(
    () => (scriptText ? evaluate(scriptText) : null),
    [scriptText]
  )

  if (!result) {
    return <p>No result to report.</p>
  }
  if (Array.isArray(result.errors)) {
    return <ErrorOutput errors={result.errors} />
  }
  return <ReactJson src={result.value} />
}
