import { EvalJSResult } from '@coolscript/eval-js'
import { ErrorOutput } from '../ErrorOutput'

export type JsEvalOutputViewProps = {
  result?: EvalJSResult
}

export function JsEvalOutputView(props: JsEvalOutputViewProps) {
  if (!props.result) {
    return <p>No result to report.</p>
  }
  if (Array.isArray(props.result.errors)) {
    return <ErrorOutput errors={props.result.errors} />
  }
  return <pre>{JSON.stringify(props.result.value)}</pre>
}
