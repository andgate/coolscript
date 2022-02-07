import { useMemo } from 'react'
import { EvalJSResult, evalCS } from '@coolscript/eval-js'
import { usePlaygroundStore } from '../../PlaygroundContext'
import { ErrorOutput } from './ErrorOutput'

export function EvalJSOutput() {
  const { scriptText } = usePlaygroundStore()
  const result: EvalJSResult | null = useMemo(
    () => (scriptText ? evalCS(scriptText) : null),
    [scriptText]
  )

  if (!result) {
    return <p>No result to report.</p>
  }
  if (Array.isArray(result.errors)) {
    return <ErrorOutput errors={result.errors} />
  }
  return <pre>{JSON.stringify(result.value)}</pre>
}
