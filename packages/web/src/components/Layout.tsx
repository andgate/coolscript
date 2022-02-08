import { Outlet } from 'react-router-dom'
import { style } from 'typestyle'
import * as csstips from 'csstips'
import { Header } from './Header'

const layoutRoot = style(csstips.flex)

export function Layout() {
  return (
    <div className={layoutRoot}>
      <Header />
      <Outlet />
    </div>
  )
}
