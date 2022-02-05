import { media, style } from 'typestyle'
import * as csstips from 'csstips'
import { px } from 'csx'
import { EditorPanel } from './EditorPanel'
import { OutputPanel } from './OutputPanel'
import { PlaygroundProvider } from './PlaygroundProvider'

const playgroundRoot = style(
  csstips.flex,
  csstips.fillParent,
  {
    paddingLeft: px(8),
    paddingRight: px(8)
  },
  media({ maxWidth: 699 }, csstips.vertical, csstips.verticallySpaced(px(8))),
  media(
    { minWidth: 700 },
    csstips.horizontal,
    csstips.horizontallySpaced(px(8))
  )
)

export function Playground() {
  return (
    <div className={playgroundRoot}>
      <PlaygroundProvider>
        <EditorPanel></EditorPanel>
        <OutputPanel></OutputPanel>
      </PlaygroundProvider>
    </div>
  )
}
