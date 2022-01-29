import { usePlaygroundContext } from '../../../PlaygroundContext'
import { JsEvalOutputView } from './JsEvalOutputView'

export function JsEvalOutput() {
  const { store } = usePlaygroundContext()
  return <JsEvalOutputView result={store.results.jsEval} />
}
