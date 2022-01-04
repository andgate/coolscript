import { style } from 'typestyle'
import * as csstips from 'csstips'
import { px } from 'csx'

const headerRoot = style(
  csstips.horizontal,
  csstips.center,
  csstips.horizontallySpaced(px(27)),
  csstips.height(px(50)),
  { paddingLeft: px(20) }
)

const headerTitleText = style({ fontSize: px(24) })

export function Header() {
  return (
    <div className={headerRoot}>
      <div className={headerTitleText}>CoolScript</div>
    </div>
  )
}
