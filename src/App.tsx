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
import AdminPage from './pages/AdminPage'
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

// 管理者(admin)以外を弾くラッパー。PrivateRoute の内側で使う前提（認証は済んでいる）。
// admin でなければダッシュボードへ戻す（＝画面を見せない）。本当の防御はサーバー側(SecurityConfig)。
function AdminRoute({ children }: { children: ReactNode }) {
    const { currentUser } = useAuth()
    if (!currentUser?.admin) {
        return <Navigate to="/dashboard" replace />
    }
    return <>{children}</>
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                {/* トップ("/")はダッシュボードへ寄せる。/dashboard は認証必須なので、
                    未ログインなら PrivateRoute 経由で自動的に /login へ流れる */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

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
                    {/* 患者登録：admin 限定。サーバー側で POST /api/patients を ADMIN 限定にしたため、
                        一般ユーザーが URL 直打ちでフォームに到達しても送信時に必ず 403 になる。
                        入力させてから弾くのではなく画面ごと見せない（/admin と同じ方針） */}
                    <Route path="/patients/create" element={<AdminRoute><PatientCreatePage /></AdminRoute>} />
                    {/* 管理ページ：admin 限定（AdminRoute で非adminはダッシュボードへ） */}
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                </Route>

                {/* 未定義パス（catch-all）はダッシュボードへ寄せる。白画面で行き止まりにしない。
                    ここも /dashboard 経由なので未ログインなら /login へ流れる */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
