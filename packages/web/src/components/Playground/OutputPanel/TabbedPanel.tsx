import { useState } from 'react'
import { style } from 'typestyle'
import * as csstips from 'csstips'
import { px } from 'csx'

const tabbedPanelRoot = style(csstips.flex, {
  backgroundColor: '#FFFFFF',
  color: '#000000'
})

const tabbedPanelHeader = style({
  overflow: 'hidden',
  borderWidth: px(1),
  borderTopStyle: 'solid',
  borderBottomStyle: 'none',
  borderLeftStyle: 'solid',
  borderRightStyle: 'solid',
  borderColor: '#CCCCCC'
})

const tabButton = style({
  backgroundColor: 'inherit',
  borderTopStyle: 'none',
  borderBottomStyle: 'none',
  borderLeftStyle: 'none',
  borderRightStyle: 'solid',
  borderWidth: px(1),
  borderColor: '#CCCCCC',
  outline: 'none',
  cursor: 'pointer',
  minWidth: px(75),
  height: px(40)
})

const activeTabButton = style({
  backgroundColor: '#CCCCCC',
  borderStyle: 'none',
  cursor: 'default',
  minWidth: px(75),
  height: px(40)
})

const tabContent = (isActive: boolean) =>
  style({
    display: isActive ? 'block' : 'none',
    borderWidth: px(1),
    borderStyle: 'solid',
    borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
    paddingTop: px(20),
    paddingLeft: px(10),
    paddingRight: px(10)
  })

export type Tab = {
  label: string
  element: JSX.Element
}

export function Tab(label: string, element: JSX.Element) {
  return { label, element }
}

export type TabbedPanelProps = {
  tabs: Array<Tab>
}

export function TabbedPanel(props: TabbedPanelProps) {
  const tabs = props.tabs
  const [currentTab, setCurrentTab] = useState<string>(tabs[0].label)

  return (
    <div className={tabbedPanelRoot}>
      <div className={tabbedPanelHeader}>
        {tabs.map((tab) => {
          const isActive = tab.label == currentTab
          return (
            <button
              key={tab.label}
              className={isActive ? activeTabButton : tabButton}
              onClick={() => setCurrentTab(tab.label)}>
              {tab.label}
            </button>
          )
        })}
      </div>
      {tabs.map((tab) => (
        <div key={tab.label} className={tabContent(tab.label == currentTab)}>
          {tab.element}
        </div>
      ))}
    </div>
  )
}
