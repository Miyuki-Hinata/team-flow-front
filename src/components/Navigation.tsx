import { Link, useNavigate } from 'react-router-dom'

const Navigation = () => {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <div>
            <Link to="/announcements">お知らせ一覧</Link>
            <Link to="/patients">患者一覧</Link>
            <Link to="/tasks">全タスク一覧</Link>
            <Link to="/tasks/my-tasks">マイタスク</Link>
            <Link to="/mypage">マイページ</Link>
            <button onClick={handleLogout}>ログアウト</button>
        </div>
    )
}

export default Navigation