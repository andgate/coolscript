import { parse } from 'language-coolscript'

export function App() {
  return <h1>{parse('hello world').tag}</h1>;
}
