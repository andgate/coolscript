import { parse } from '@coolscript/parser'

export function App() {
  return <h1>{parse('hello world').tag}</h1>
}
