import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setAccessToken } from '../api/tokenStore'
import { logout } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import PasswordChangeModal from './PasswordChangeModal'

const Navigation = () => {
    const navigate = useNavigate()
    const { currentUser, setCurrentUser } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

    const handleLogout = async () => {
        try {
            // サーバーへログアウトを通知し、DBのリフレッシュトークン失効とCookie削除を行う
            await logout()
        } catch (e) {
            // 通信失敗などでサーバー側処理ができなくても、この端末はログアウト状態にしたいのでログだけ残す
            // （Cookieは残るが、次回リフレッシュ失敗時に未ログイン状態へ落ちる）
            console.error('ログアウト通知に失敗しました', e)
        } finally {
            // 成功・失敗にかかわらず、最低限この端末の画面はログアウト状態にする
            setAccessToken(null)
            setCurrentUser(null)
            navigate('/login')
        }
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

            <PasswordChangeModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />

        </div>
    )
}

export default Navigation