import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from 'styled-components'
import { themeLight } from './styles/theme.ts'


// Provider の重ね順：Theme → Toast → Auth
// Toast は theme トークンを使うので ThemeProvider の内側に置く。
// Auth 内で発生した通知（ログイン失敗など）も出せるように Toast の内側に Auth を置く。
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={themeLight}>
            <ToastProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    </StrictMode>,
)
