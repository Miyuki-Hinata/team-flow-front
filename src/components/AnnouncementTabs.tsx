import type { Announcement } from "../types/announcement"

type Props = {
    announcements: Announcement[]
    activeTab: 'unread' | 'read'
    onTabChange: (tab: 'unread' | 'read') => void
}

const AnnouncementTabs = ({announcements, activeTab, onTabChange}: Props) => {

    const unreadCount = announcements.filter(a => !a.isRead).length

    const readCount = announcements.filter(a => a.isRead).length

    return(
        <div>
            <button
                onClick={() => onTabChange('unread')}
                style={{fontWeight: activeTab === 'unread' ? 'bold' : 'normal'}}
            >
                未読 ({unreadCount})
            </button>
            <button
                onClick={() => onTabChange('read')}
                style={{fontWeight: activeTab === 'read' ? 'bold' : 'normal'}}
            >
                既読({readCount})
            </button>
        </div>
    )
}

export default AnnouncementTabs