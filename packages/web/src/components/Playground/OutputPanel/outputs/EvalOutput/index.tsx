import { EvalOutputView } from './EvalOutputView'
import { usePlaygroundContext } from '../../../PlaygroundContext'

export function EvalOutput() {
  const { store } = usePlaygroundContext()
  return <EvalOutputView result={store.results.eval} />
}
