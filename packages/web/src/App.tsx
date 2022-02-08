import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Playground } from './components/Playground'
import { Home } from './components/Home'
import { Install } from './components/Install'
import { Docs } from './components/Docs'
import { NotFound } from './components/NotFound'

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="install" element={<Install />} />
          <Route path="docs" element={<Docs />} />
          <Route path="play" element={<Playground />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}
