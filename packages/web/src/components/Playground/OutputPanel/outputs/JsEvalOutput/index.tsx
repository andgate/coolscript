import { usePlaygroundStore } from '../../../PlaygroundContext'
import { JsEvalOutputView } from './JsEvalOutputView'

export function JsEvalOutput() {
  const { evalJSResult } = usePlaygroundStore()
  return <JsEvalOutputView result={evalJSResult} />
}
