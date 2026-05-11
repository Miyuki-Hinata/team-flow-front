import { Link } from 'react-router-dom'

const Navigation = () => {
    return (
        <div>
            <Link to="/announcements">お知らせ一覧</Link>
            <Link to="/tasks">全タスク一覧</Link>
            <Link to="/my-tasks">マイタスク</Link>
             <Link to="/mypage">マイページ</Link>
        </div>
    )
}

export default Navigation