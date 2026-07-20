import type { Announcement } from "../types/announcement"
import { Tabs } from './ui/Tabs'
import type { TabItem } from './ui/Tabs'

// AnnouncementsPage 専用のタブ値
type AnnouncementTab = 'unread' | 'read'

type Props = {
    announcements: Announcement[]
    activeTab: AnnouncementTab
    onTabChange: (tab: AnnouncementTab) => void
}

// お知らせ一覧のタブ（未読/既読）。汎用 Tabs を薄くラップし、件数計算とラベル生成のみ担う
const AnnouncementTabs = ({ announcements, activeTab, onTabChange }: Props) => {

    const unreadCount = announcements.filter(a => !a.isRead).length
    const readCount = announcements.filter(a => a.isRead).length

    // items を配列で持つと汎用 Tabs に素直に渡せる。表示順もここで管理
    const items: TabItem<AnnouncementTab>[] = [
        { value: 'unread', label: '未読', count: unreadCount },
        { value: 'read', label: '既読', count: readCount },
    ]

    return (
        <Tabs items={items} activeValue={activeTab} onChange={onTabChange} />
    )
}

export default AnnouncementTabs
