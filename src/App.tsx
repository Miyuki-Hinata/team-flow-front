import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import TasksPage from './pages/TasksPage'
import TaskDetailPage from './pages/TaskDetailPage'
import TaskCreatePage from './pages/TaskCreatePage'
import Navigation from './components/Navigation'
import AnnouncementDetailPage from './pages/AnnouncementDetailPage'
import MyTasksPage from './pages/MyTasksPage'

function App() {
    const token = localStorage.getItem('token')
    return (
        <BrowserRouter>
            {token && <Navigation />}
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />}/>
                <Route path="/tasks" element={<TasksPage />}/>
                <Route path="/tasks/create" element={<TaskCreatePage/>}/>
                <Route path="/tasks/my-tasks" element={<MyTasksPage/>}/>
                <Route path="/tasks/:id" element={<TaskDetailPage/>}/>
                <Route path="/announcements/:id" element={<AnnouncementDetailPage/>}
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App