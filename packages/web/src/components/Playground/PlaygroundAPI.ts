import { PlaygroundStore } from './PlaygroundStore'

export type PlaygroundAPI = {
  store: PlaygroundStore
  setEditorText(text: string): void
  runScript(): void
}
