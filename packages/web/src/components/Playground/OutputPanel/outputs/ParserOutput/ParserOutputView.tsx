import ReactJson from 'react-json-view'
import type { ParseResult } from '@coolscript/parser'
import { ErrorOutput } from '../ErrorOutput'

export type ParserOutputViewProps = {
  result?: ParseResult
}

export function ParserOutputView(props: ParserOutputViewProps) {
  if (!props.result) {
    return <p>No result to report.</p>
  }
  if (Array.isArray(props.result.errors)) {
    return <ErrorOutput errors={props.result.errors} />
  }
  return <ReactJson src={props.result.term}></ReactJson>
}
