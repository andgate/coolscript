/* eslint-disable @typescript-eslint/no-unused-vars */
import example1 from './example1.cs'
import example2 from './example2.cs'
import { numberExamples } from './number'
import { stringExamples } from './string'
import { letExamples } from './let'

export { numberExamples } from './number'
export { stringExamples } from './string'
export { letExamples } from './let'

export const examples: { [key: string]: string } = {
  example1,
  example2,
  ...numberExamples,
  ...stringExamples,
  ...letExamples
}
