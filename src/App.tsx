import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import TasksPage from './pages/TasksPage'
import TaskDetailPage from './pages/TaskDetailPage'
import TaskCreatePage from './pages/TaskCreatePage'
import Navigation from './components/Navigation'
import AnnouncementDetailPage from './pages/AnnouncementDetailPage'
import MyTasksPage from './pages/MyTasksPage'
import PatientPage from './pages/PatientPage'
import PatientCreatePage from './pages/PatientCreatePage'
import PatientDetailPage from './pages/PatientDetailPage'

// ログインしていないと入れないルートのラッパーコンポーネント
// 未ログインの場合は、今いたパスをstateに乗せてログインページへリダイレクトする
function PrivateRoute({ children }: { children: ReactNode }) {
    const { currentUser, isLoading } = useAuth()
    const location = useLocation()

    // 起動時のサイレントリフレッシュ中は何も描画しない（チラつき防止）
    if (isLoading) return null

    if (!currentUser) {
        // state={{ from: ... } でログインページに「どこから来たか」を渡す
        return <Navigate to="/login" state={{ from: location.pathname }} replace />
    }

    return <>{children}</>
}

function App() {
    const { currentUser } = useAuth()
    return (
        <BrowserRouter>
            {currentUser && <Navigation />}
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/announcements" element={<PrivateRoute><AnnouncementsPage /></PrivateRoute>} />
                <Route path="/tasks" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
                <Route path="/tasks/create" element={<PrivateRoute><TaskCreatePage /></PrivateRoute>} />
                <Route path="/tasks/my-tasks" element={<PrivateRoute><MyTasksPage /></PrivateRoute>} />
                <Route path="/tasks/:id" element={<PrivateRoute><TaskDetailPage /></PrivateRoute>} />
                <Route path="/announcements/:id" element={<PrivateRoute><AnnouncementDetailPage /></PrivateRoute>} />
                <Route path="/patients" element={<PrivateRoute><PatientPage /></PrivateRoute>} />
                <Route path="/patients/:id" element={<PrivateRoute><PatientDetailPage /></PrivateRoute>} />
                <Route path="/patients/create" element={<PrivateRoute><PatientCreatePage /></PrivateRoute>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
