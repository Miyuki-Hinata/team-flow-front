import type { Announcement } from "../types/announcement"
import styled from 'styled-components'
import AnnouncementCard from "./AnnouncementCard"

type Props = {
    announcements: Announcement[]
    onRead: (id: number) => void
}

// カード列：縦積み＋ spacing.md の gap（他の一覧系と統一して一体感を出す）
const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

const UrgentAnnouncements = ({ announcements, onRead }: Props) => {
    // 優先度=HIGH かつ 未読 だけ抽出（絞り込みロジックは従来どおり維持）
    const urgent = announcements.filter(a => a.priority === "HIGH" && !a.isRead)

    return (
        <List>
            {urgent.map(announcement => (
                <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onRead={onRead}
                />
            ))}
        </List>
    )
}

export default UrgentAnnouncements
