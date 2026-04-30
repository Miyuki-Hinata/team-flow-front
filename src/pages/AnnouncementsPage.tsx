
import { useState, useEffect } from 'react'
import { announcements as fetchAnnouncements } from '../api/announcements'
import type { Announcement } from '../types/announcement'

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

    return (
        <div>
            <UrgentAnnouncements announcements={announcements}/>
            <Tabs
                announcements={announcements}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            <Announcements announcements={filteredAnnouncements}/>
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