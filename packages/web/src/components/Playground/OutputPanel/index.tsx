import { style } from 'typestyle'
import * as csstips from 'csstips'
import { TabbedPanel, Tab } from './TabbedPanel'
import { EvalOutput, JsEvalOutput, JsOutput } from './outputs'

const outputPanelRoot = style(csstips.flex1)

export function OutputPanel() {
  const outputTabs = [
    Tab('js', <JsOutput />),
    Tab('js-eval', <JsEvalOutput />),
    Tab('eval', <EvalOutput />)
  ]

  return (
    <div className={outputPanelRoot}>
      <TabbedPanel tabs={outputTabs}></TabbedPanel>
    </div>
  )
}
