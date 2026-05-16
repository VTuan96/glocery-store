import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { theme } from './theme'
import { useNetworkStore } from './store/networkStore'

registerSW({ immediate: true })

// Wire online/offline events to networkStore
const { setOnline } = useNetworkStore.getState()
window.addEventListener('online', () => setOnline(true))
window.addEventListener('offline', () => setOnline(false))

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
