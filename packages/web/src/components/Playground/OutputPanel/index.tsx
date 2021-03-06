import { style } from 'typestyle'
import * as csstips from 'csstips'
import { TabbedPanel, Tab } from './TabbedPanel'
import { EvalStandardOutput, EvalJSOutput, JsOutput } from './outputs'

const outputPanelRoot = style(csstips.flex1)

export function OutputPanel() {
  const outputTabs = [
    Tab('js', <JsOutput />),
    Tab('eval-js', <EvalJSOutput />),
    Tab('eval', <EvalStandardOutput />)
  ]

  return (
    <div className={outputPanelRoot}>
      <TabbedPanel tabs={outputTabs}></TabbedPanel>
    </div>
  )
}
