import TaskBoard from './components/TaskBoard'
import { ThemeProvider } from './context/ThemeContext'
import { CssBaseline } from '@mui/material'

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <TaskBoard />
    </ThemeProvider>
  )
}

export default App
