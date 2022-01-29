import { JsGenResult } from '@coolscript/backend-js'
import { ErrorOutput } from '../ErrorOutput'

export type JsOutputViewProps = {
  result?: JsGenResult
}

export function JsOutputView(props: JsOutputViewProps) {
  if (!props.result) {
    return <p>No result to report.</p>
  }
  if (Array.isArray(props.result.errors)) {
    return <ErrorOutput errors={props.result.errors} />
  }

  return <pre>{props.result.source}</pre>
}
