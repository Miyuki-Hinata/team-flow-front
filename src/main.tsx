import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from 'styled-components'
import { themeLight } from './styles/theme.ts'


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={themeLight}>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ThemeProvider>
    </StrictMode>,
)
