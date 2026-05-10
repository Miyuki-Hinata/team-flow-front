import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AnnouncementsPage  from './pages/AnnouncementsPage'
import TasksPage from './pages/TasksPage'
import TaskDetailPage from './pages/TaskDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />}/>
        <Route path="/tasks" element={<TasksPage />}/>
        <Route path="/tasks/:id" element={<TaskDetailPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App