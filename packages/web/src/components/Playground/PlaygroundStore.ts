export type PlaygroundStore = {
  editorText: string
  setEditorText(text: string): void
  scriptText: string
  runScript(): void
}
