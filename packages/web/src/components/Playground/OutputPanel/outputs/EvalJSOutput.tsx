import { useMemo } from 'react'
import { EvalResult, evalCS } from '@coolscript/eval'
import { usePlaygroundStore } from '../../PlaygroundContext'
import { ErrorOutput } from './ErrorOutput'

export function EvalJSOutput() {
  const { scriptText } = usePlaygroundStore()
  const result: EvalResult | null = useMemo(
    () => (scriptText ? evalCS(scriptText, { backend: 'js' }) : null),
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
