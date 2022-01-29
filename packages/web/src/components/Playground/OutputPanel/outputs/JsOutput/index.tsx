import { usePlaygroundContext } from '../../../PlaygroundContext'
import { JsOutputView } from './JsOutputView'

export function JsOutput() {
  const { store } = usePlaygroundContext()
  return <JsOutputView result={store.results.jsGen} />
}
