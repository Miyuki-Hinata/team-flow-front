import type { Announcement } from "../types/announcement"
import styled from 'styled-components'
import AnnouncementCard from "./AnnouncementCard"

type Props = {
    announcements: Announcement[]
    onRead: (id: number) => void
}

// カード列：デザインどおり縦積み＋カード間に一定の間隔を空ける（密着させない）。
// デザインの gap:12px はトークンに無い値のため、最も近い標準余白 spacing.md(16px) を採用する
// （§2 の「定義外の値を追加しない＝トークンのみ使う」に従い、12px を直書きしない）。
const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

const AnnouncementList = ({ announcements, onRead }: Props) => {
    return (
        <List>
            {announcements.map(announcement => (
                <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onRead={onRead}
                />
            ))}
        </List>
    )
}

export default AnnouncementList
