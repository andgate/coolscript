/* eslint-disable @typescript-eslint/no-unused-vars */
import example1 from './example1.cs'
import example2 from './example2.cs'
import { number_examples } from './number'

export const examples: { [key: string]: string } = {
  example1,
  example2,
  ...number_examples
}
