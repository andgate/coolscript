import { EvalOutputView } from './EvalOutputView'
import { usePlaygroundStore } from '../../../PlaygroundContext'

export function EvalOutput() {
  const { evalResult } = usePlaygroundStore()
  return <EvalOutputView result={evalResult} />
}
