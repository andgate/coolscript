import { valueExamples } from './value'
import { letExamples } from './let'
import { lambdaExamples } from './lambda'

export const termExamples: { [key: string]: string } = {
  ...valueExamples,
  ...letExamples,
  ...lambdaExamples
}
