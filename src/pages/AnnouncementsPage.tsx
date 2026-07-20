import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { announcements as fetchAnnouncements, markAsRead } from '../api/announcements'
import type { Announcement } from '../types/announcement'
import UrgentAnnouncements from '../components/UrgentAnnouncements'
import AnnouncementTabs from '../components/AnnouncementTabs'
import AnnouncementList from '../components/AnnouncementList'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { useAnnouncementCount } from '../contexts/AnnouncementCountContext'

// セクション同士の間隔（緊急 / タブ / リスト）を統一するための縦積み器
const Sections = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

// 「＋ お知らせを作成」ボタンのアイコン（PatientPage と同じ + アイコン）
const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const AnnouncementsPage = () => {
    const navigate = useNavigate()
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread')
    // サイドバー未読バッジ同期用。既読化後に refresh を呼んでバッジ数を最新化する
    const { refresh: refreshUnreadCount } = useAnnouncementCount()

    useEffect(() => {
        fetchAnnouncements().then(data => {
            setAnnouncements(data)
        })
    }, [])

    // タブに応じて絞り込む
    const filteredAnnouncements = announcements.filter(a =>
        activeTab === 'unread' ? !a.isRead : a.isRead
    )

    const handleRead = async (id: number) => {
        await markAsRead(id)
        // 該当のお知らせの isRead を true にする
        setAnnouncements(announcements.map(a => a.id === id ? { ...a, isRead: true } : a))
        // サイドバー未読バッジも同期。await せず投げっぱなしで良い（UI 更新はローカル state で先に反映済み）
        refreshUnreadCount()
    }

    // subtitle 用に未読件数を軽く算出（fetch 済みデータから）
    const unreadCount = announcements.filter(a => !a.isRead).length

    return (
        <div>
            <PageHeader
                title="お知らせ"
                subtitle={`未読 ${unreadCount} 件`}
                action={
                    <Button variant="primary" onClick={() => navigate('/announcements/create')}>
                        <PlusIcon />
                        お知らせを作成
                    </Button>
                }
            />

            <Sections>
                {/* 緊急のお知らせ（HIGH かつ未読）を最上段に。既存機能を維持 */}
                <UrgentAnnouncements
                    announcements={announcements}
                    onRead={handleRead}
                />

                {/* 未読/既読タブ */}
                <AnnouncementTabs
                    announcements={announcements}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {/* タブ絞り込み後のお知らせ一覧 */}
                <AnnouncementList
                    announcements={filteredAnnouncements}
                    onRead={handleRead}
                />
            </Sections>
        </div>
    )
}

export default AnnouncementsPage
