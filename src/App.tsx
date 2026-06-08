import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function App() {
    const { currentUser } = useAuth()
    return (
        <BrowserRouter>
            {currentUser && <Navigation />}
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
                <Route path="/patients" element={<PatientPage/>}/>
                <Route path="/patients/:id" element={<PatientDetailPage/>}/>
                <Route path="/patients/create" element={<PatientCreatePage/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App