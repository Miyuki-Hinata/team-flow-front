import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AnnouncementsPage  from './pages/AnnouncementsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App