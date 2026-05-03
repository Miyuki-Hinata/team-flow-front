
import { useState, useEffect } from 'react'
import { announcements as fetchAnnouncements, markAsRead } from '../api/announcements'
import type { Announcement } from '../types/announcement'
import UrgentAnnouncements from '../components/UrgentAnnouncements'
import AnnouncementTabs from '../components/AnnouncementTabs'
import AnnouncementList from '../components/AnnouncementList'

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread')

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
        setAnnouncements(announcements.map(a => a.id === id ? {...a, isRead: true}: a
        ))
    }

    return (
        <div>
            <UrgentAnnouncements
                announcements={announcements}
                onRead={handleRead}
            />
            <AnnouncementTabs
                announcements={announcements}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            <AnnouncementList
                announcements={filteredAnnouncements}
                onRead={handleRead}
            />
        </div>
    )
}

export default AnnouncementsPage


// ┌─────────────────────────────┐
// │ 🚨 緊急のお知らせ（未読のみ）  │
// └─────────────────────────────┘
// [ 未読 (3) ]  [ 既読 ]
// ┌─────────────────────────────┐
// │ 一覧                        │
// └─────────────────────────────┘