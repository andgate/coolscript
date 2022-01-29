import { style } from 'typestyle'
import * as csstips from 'csstips'
import { TabbedPanel, Tab } from './TabbedPanel'
import { ParserOutput, EvalOutput, JsEvalOutput, JsOutput } from './outputs'

const outputPanelRoot = style(csstips.flex)

export function OutputPanel() {
  const outputTabs = [
    Tab('js', <JsOutput />),
    Tab('js-eval', <JsEvalOutput />),
    Tab('parser', <ParserOutput />),
    Tab('eval', <EvalOutput />)
  ]

  return (
    <div className={outputPanelRoot}>
      <TabbedPanel tabs={outputTabs}></TabbedPanel>
    </div>
  )
}
