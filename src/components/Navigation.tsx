import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setAccessToken } from '../api/tokenStore'
import { useAuth } from '../contexts/AuthContext'
import PasswordChangeModal from './PasswordChangeModal'

const Navigation = () => {
    const navigate = useNavigate()
    const { currentUser, setCurrentUser } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

    const handleLogout = () => {
        setAccessToken(null)
        setCurrentUser(null)
        navigate('/login')
    }

    return (
        <div>
            <Link to="/announcements">お知らせ一覧</Link>
            <Link to="/patients">患者一覧</Link>
            <Link to="/tasks">全タスク一覧</Link>
            <Link to="/tasks/my-tasks">マイタスク</Link>

            <div style={{ position: 'relative', display: 'inline-block' }}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {currentUser?.lastName} {currentUser?.firstName}
                </button>
                {isMenuOpen && (
                    <div style={{
                        position: 'absolute',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        zIndex: 1
                    }}>
                        <button onClick={() => {
                            setIsPasswordModalOpen(true)
                            setIsMenuOpen(false)
                        }}>
                            パスワード変更
                        </button>
                        <button onClick={handleLogout}>ログアウト</button>
                    </div>
                )}
            </div>

            {isPasswordModalOpen && (
                <PasswordChangeModal onClose={() => setIsPasswordModalOpen(false)} />
            )}
        </div>
    )
}

export default Navigation