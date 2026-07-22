import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import AnnouncementCreatePage from './pages/AnnouncementCreatePage'
import TasksPage from './pages/TasksPage'
import TaskDetailPage from './pages/TaskDetailPage'
import TaskCreatePage from './pages/TaskCreatePage'
import AnnouncementDetailPage from './pages/AnnouncementDetailPage'
import MyTasksPage from './pages/MyTasksPage'
import MyPatientsPage from './pages/MyPatientsPage'
import PatientPage from './pages/PatientPage'
import PatientCreatePage from './pages/PatientCreatePage'
import PatientDetailPage from './pages/PatientDetailPage'
import { AppLayout} from './layouts/AppLayout'

// ログインしていないと入れないルートのラッパーコンポーネント
// 未ログインの場合は、今いたパスをstateに乗せてログインページへリダイレクトする
function PrivateRoute({ children }: { children: ReactNode }) {
    const { currentUser, isLoading } = useAuth()
    const location = useLocation()

    // ①ロード中は何も表示しない
    // 起動時のサイレントリフレッシュ中は何も描画しない（チラつき防止）
    if (isLoading) return null

    // ②未ログインならログインページへ
    if (!currentUser) {
        // state={{ from: ... } でログインページに「どこから来たか」を渡す
        return <Navigate to="/login" state={{ from: location.pathname }} replace />
    }

    // ③ログイン済みなら、本来の子コンポーネントを表示
    return <>{children}</>
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                {/* ログイン必須のルートをAppLayoutでまとめる */}
                <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/announcements" element={<AnnouncementsPage />} />
                    <Route path="/announcements/create" element={<AnnouncementCreatePage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/tasks/create" element={<TaskCreatePage />} />
                    <Route path="/tasks/my-tasks" element={<MyTasksPage />} />
                    <Route path="/my-patients" element={<MyPatientsPage />} />
                    <Route path="/tasks/:id" element={<TaskDetailPage />} />
                    <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
                    <Route path="/patients" element={<PatientPage />} />
                    <Route path="/patients/:id" element={<PatientDetailPage />} />
                    <Route path="/patients/create" element={<PatientCreatePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
