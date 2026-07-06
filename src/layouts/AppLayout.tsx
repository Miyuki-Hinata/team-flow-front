// layouts/AppLayout.tsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { UserMenu } from '../components/ui/UserMenu'

export const AppLayout = () => {
    // サイドバー開閉。AISummaryCardで作ったisOpenと全く同じパターンの再利用
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    return (
        <div style={{ display: 'flex' }}>
            {/* サイドバー */}
            <aside style={{ width: isSidebarOpen ? '240px' : '0px', overflow: 'hidden' }}>
                {/* ナビゲーションリンク（Link to="/dashboard" など）は次回追加 */}
            </aside>

            <div style={{ flex: 1 }}>
                {/* ヘッダー */}
                <header style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
                    <UserMenu />
                </header>

                {/* ここに各ページ（PatientDetailPageなど）が差し込まれる */}
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}