import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoute'
import { useAuth } from './hooks/useAuth'
import { initializeEncryptionKey } from './utils/Crypto'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#646cff',
    },
    background: {
      default: '#242424',
      paper: '#1a1a1a',
    },
  },
})

function App() {
  const { checkAuth, isLoading } = useAuth()

  useEffect(() => {
    checkAuth()
    initializeEncryptionKey()
  }, [checkAuth])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
