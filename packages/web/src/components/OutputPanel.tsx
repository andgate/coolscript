import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import ReactJson from 'react-json-view'
import prettyJs from 'pretty-js'
import { evaluate } from '@coolscript/eval'
import { parse } from '@coolscript/parser'
import type { Term, Value } from '@coolscript/syntax'
import { generateJS } from '@coolscript/backend-js'
import { style } from 'typestyle'
import * as csstips from 'csstips'
import { EditorContext } from '../contexts/EditorContext'
import { px } from 'csx'

const outputPanelRoot = style(csstips.flex, {
  backgroundColor: '#FFFFFF',
  color: '#000000'
})

const tabContainer = style({
  overflow: 'hidden',
  borderWidth: px(1),
  borderStyle: 'solid',
  borderColor: '#CCCCCC'
})

const tabLink = style({
  backgroundColor: 'inherit',
  borderWidth: px(1),
  borderStyle: 'solid',
  borderColor: '#CCCCCC',
  outline: 'none',
  cursor: 'pointer',
  minWidth: px(75),
  height: px(40)
})

const activeTabLink = style({
  backgroundColor: '#CCCCCC',
  border: 'none',
  outline: 'none',
  cursor: 'default',
  minWidth: px(75),
  height: px(40)
})

const tabContent = style({
  display: 'none',
  borderWidth: px(1),
  borderStyle: 'solid',
  borderColor: '#CCCCCC',
  backgroundColor: '#FFFFFF',
  paddingTop: px(20),
  paddingLeft: px(10),
  paddingRight: px(10)
})

export function OutputPanel() {
  const parseTabContent = useRef<HTMLDivElement>()
  const evalTabContent = useRef<HTMLDivElement>()
  const jsGenTabContent = useRef<HTMLDivElement>()
  const parseTabButton = useRef<HTMLButtonElement>()
  const evalTabButton = useRef<HTMLButtonElement>()
  const jsGenTabButton = useRef<HTMLButtonElement>()
  const [currentTab, setCurrentTab] = useState<string>('parser')

  useEffect(() => {
    parseTabContent.current.style.display = 'none'
    evalTabContent.current.style.display = 'none'
    jsGenTabContent.current.style.display = 'none'

    switch (currentTab) {
      case 'parser':
        parseTabContent.current.style.display = 'block'
        break
      case 'eval':
        evalTabContent.current.style.display = 'block'
        break
      case 'js':
        jsGenTabContent.current.style.display = 'block'
        break
      default:
        console.error('Unknown tab id', currentTab)
        break
    }
  }, [currentTab])

  useEffect(() => {
    parseTabButton.current.className = tabLink
    evalTabButton.current.className = tabLink
    jsGenTabButton.current.className = tabLink

    switch (currentTab) {
      case 'parser':
        parseTabButton.current.className = activeTabLink
        break
      case 'eval':
        evalTabButton.current.className = activeTabLink
        break
      case 'js':
        jsGenTabButton.current.className = activeTabLink
        break
      default:
        console.error('Unknown tab id', currentTab)
        break
    }
  }, [currentTab])

  const { editorState } = useContext(EditorContext)
  const parseResult = useMemo<Term | null>(
    () => parse(editorState.textContent),
    [editorState]
  )
  const evalResult = useMemo<Value | null>(
    () => (parseResult ? evaluate(parseResult) : null),
    [parseResult]
  )
  const jsGenResult = useMemo<string | null>(
    () => (parseResult ? generateJS(parseResult) : null),
    [parseResult]
  )

  return (
    <div className={outputPanelRoot}>
      <div className={tabContainer}>
        <button
          ref={parseTabButton}
          className={tabLink}
          onClick={() => setCurrentTab('parser')}>
          parser
        </button>
        <button
          ref={evalTabButton}
          className={tabLink}
          onClick={() => setCurrentTab('eval')}>
          eval
        </button>
        <button
          ref={jsGenTabButton}
          className={tabLink}
          onClick={() => setCurrentTab('js')}>
          js
        </button>
      </div>
      <div ref={parseTabContent} className={tabContent}>
        {parseResult ? (
          <div>
            <ReactJson src={parseResult}></ReactJson>
          </div>
        ) : (
          <p>Parsing failed.</p>
        )}
      </div>
      <div ref={evalTabContent} className={tabContent}>
        {evalResult ? (
          <div>
            <ReactJson src={evalResult}></ReactJson>
          </div>
        ) : (
          <p>Evaluation failed</p>
        )}
      </div>
      <div ref={jsGenTabContent} className={tabContent}>
        {jsGenResult ? (
          <pre>{prettyJs(jsGenResult)}</pre>
        ) : (
          <p>Javascript code generation failed.</p>
        )}
      </div>
    </div>
  )
}
