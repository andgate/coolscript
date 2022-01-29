import ReactJson from 'react-json-view'
import type { EvalResult } from '@coolscript/eval'
import { ErrorOutput } from '../ErrorOutput'

export type EvalOutputViewProps = {
  result?: EvalResult
}

export function EvalOutputView(props: EvalOutputViewProps) {
  if (!props.result) {
    return <p>No result to report.</p>
  }
  if (Array.isArray(props.result.errors)) {
    return <ErrorOutput errors={props.result.errors} />
  }
  return <ReactJson src={props.result.value} />
}
