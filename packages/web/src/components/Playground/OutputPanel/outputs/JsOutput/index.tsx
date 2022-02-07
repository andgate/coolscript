import { usePlaygroundStore } from '../../../PlaygroundContext'
import { JsOutputView } from './JsOutputView'

export function JsOutput() {
  const { codegenJSResult } = usePlaygroundStore()
  return <JsOutputView result={codegenJSResult} />
}
