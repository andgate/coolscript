import { useMemo } from 'react'
import { codegenJS, CodegenJSResult } from '@coolscript/codegen-js'
import { usePlaygroundStore } from '../../PlaygroundContext'
import { ErrorOutput } from './ErrorOutput'

export function JsOutput() {
  const { scriptText } = usePlaygroundStore()
  const result: CodegenJSResult | null = useMemo(
    () => (scriptText ? codegenJS(scriptText) : null),
    [scriptText]
  )

  if (!result) {
    return <p>No result to report.</p>
  }
  if (Array.isArray(result.errors)) {
    return <ErrorOutput errors={result.errors} />
  }

  return <pre>{result.source}</pre>
}
