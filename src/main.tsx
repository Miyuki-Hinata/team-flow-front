import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeModeProvider } from './contexts/ThemeModeContext'


// Provider の重ね順：ThemeMode → Toast → Auth
// ThemeMode は内部で styled-components の ThemeProvider を包み込むので、下位はすべて theme を参照可能。
// Toast は theme トークンを使うので ThemeModeProvider の内側に置く。
// Auth 内で発生した通知（ログイン失敗など）も出せるように Toast の内側に Auth を置く。
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeModeProvider>
            <ToastProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ToastProvider>
        </ThemeModeProvider>
    </StrictMode>,
)
