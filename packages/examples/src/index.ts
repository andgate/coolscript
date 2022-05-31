/* eslint-disable @typescript-eslint/no-unused-vars */
import example1 from './example1.cs'
// import example2 from './example2.cs'
import { syntaxExamples } from './syntax'

export const examples: { [key: string]: string } = {
  example1,
  // example2,
  ...syntaxExamples
}
