import { usePlaygroundContext } from '../../../PlaygroundContext'
import { ParserOutputView } from './ParserOutputView'

export function ParserOutput() {
  const { store } = usePlaygroundContext()
  return <ParserOutputView result={store.results.parse} />
}
