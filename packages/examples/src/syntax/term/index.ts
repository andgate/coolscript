import { valueExamples } from './value'
import { letExamples } from './let'
import { lambdaExamples } from './lambda'
import { callExamples } from './call'

export const termExamples: { [key: string]: string } = {
  ...valueExamples,
  ...letExamples,
  ...lambdaExamples,
  ...callExamples
}
