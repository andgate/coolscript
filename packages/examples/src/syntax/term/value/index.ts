import { nullExamples } from './null'
import { boolExamples } from './bool'
import { numberExamples } from './number'
import { stringExamples } from './string'

export const valueExamples: { [key: string]: string } = {
  ...nullExamples,
  ...boolExamples,
  ...numberExamples,
  ...stringExamples
}
