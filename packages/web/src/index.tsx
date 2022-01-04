import { normalize, setupPage } from 'csstips'
import ReactDOM from 'react-dom'
import { App } from './App'

// CSS Setup
setupPage('#root')
normalize()

// React Setup
const app = document.getElementById('root')
ReactDOM.render(<App />, app)
