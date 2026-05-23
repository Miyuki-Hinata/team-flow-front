import { useState, useEffect } from 'react'
import { announcements as fetchAnnouncements } from '../api/announcements'
import type { Announcement } from '../types/announcement'
import { Link } from 'react-router-dom'

function DashboardPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])

    useEffect(() => {
        fetchAnnouncements().then(data => {
            setAnnouncements(data)
        })
    }, [])

    return (
        <div>
            <h1>Dashboard</h1>
            {announcements
                .filter(a => !a.isRead).length === 0 ? (
                    <p>新規お知らせはありません</p>
                ) : (
                announcements
                    .filter(a => !a.isRead)
                    .slice(0, 3)
                    .map((announcement) => (
                        <div key={announcement.id}>
                           <Link to="/announcements">{announcement.title}</Link>
                        </div>
                    ))
                )
            }
            <Link to="/announcements">お知らせ一覧</Link>
            <Link to="/patients">患者一覧</Link>
            <Link to="/mypage">マイページ</Link>
            <Link to="/my-tasks">マイタスク</Link>
            <Link to="/tasks">全タスク一覧</Link>
        </div>
    )
}

export default DashboardPage





// トップページ
// ・お知らせ表示　＋　お知らせ一覧へのリンク
// ・マイページへのリンク
// ・マイタスク一覧ページへのリンク
// ・全てのタスク一覧ページへのリンク
