import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { announcements as fetchAnnouncements } from '../api/announcements'
import type { Announcement } from '../types/announcement'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import AnnouncementCard from '../components/AnnouncementCard'

// 未読お知らせカードの縦積み（他一覧と同じ間隔で一体感を出す）
const CardList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

// セクションの中身のまとまりを縦積みにする器
const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

function DashboardPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])

    useEffect(() => {
        fetchAnnouncements().then(data => {
            setAnnouncements(data)
        })
    }, [])

    // 未読を抽出し、最大3件だけダッシュボードに出す（既存挙動を維持）
    const unread = announcements.filter(a => !a.isRead)
    const unreadTop3 = unread.slice(0, 3)

    // AnnouncementCard は onRead を必須で受け取るが、Dashboard は既読化しない仕様（既存維持）。
    // 挙動を変えないため noop（何もしない関数）を渡す。詳細ページ側で既読化される想定。
    const noopRead = () => {}

    return (
        <div>
            <PageHeader title="ダッシュボード" />

            <Section>
                {/* 未読ゼロなら EmptyState、あればカードを最大3件並べる */}
                {unread.length === 0 ? (
                    <EmptyState message="新規お知らせはありません" />
                ) : (
                    <CardList>
                        {unreadTop3.map(announcement => (
                            <AnnouncementCard
                                key={announcement.id}
                                announcement={announcement}
                                onRead={noopRead}
                            />
                        ))}
                    </CardList>
                )}
            </Section>

        </div>
    )
}

export default DashboardPage
