import Todo from './components/Todo'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <Todo />
    </ThemeProvider>
  )
}

export default App
