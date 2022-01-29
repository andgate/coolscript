import { style } from 'typestyle'
import { Header } from './Header'
import { Playground } from './Playground'

const layoutRoot = style({})

export function Layout() {
  return (
    <div className={layoutRoot}>
      <Header></Header>
      <Playground></Playground>
    </div>
  )
}
