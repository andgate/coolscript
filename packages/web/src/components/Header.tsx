import { Link } from 'react-router-dom'
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

const headerNavLink = style({
  fontSize: px(18),
  lineHeight: px(24.51),
  color: '#000000',
  textDecoration: 'none'
})

export function Header() {
  return (
    <div className={headerRoot}>
      <div className={headerTitleText}>😎 CoolScript</div>
      <Link to="/" className={headerNavLink}>
        Home
      </Link>
      <Link to="/install" className={headerNavLink}>
        Install
      </Link>
      <Link to="/docs" className={headerNavLink}>
        Docs
      </Link>
      <Link to="/play" className={headerNavLink}>
        Playground
      </Link>
    </div>
  )
}
