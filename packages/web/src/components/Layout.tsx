import { style } from 'typestyle'
import * as csstips from 'csstips'
import { Header } from './Header'
import { Playground } from './Playground'

const layoutRoot = style(csstips.flex)

export function Layout() {
  return (
    <div className={layoutRoot}>
      <Header></Header>
      <Playground></Playground>
    </div>
  )
}
