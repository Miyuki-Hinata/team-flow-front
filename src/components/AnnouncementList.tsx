import type { Announcement } from "../types/announcement"
import AnnouncementCard from "./AnnouncementCard"

type Props = {
    announcements: Announcement[]
    onRead: (id: number) => void
}

const AnnouncementList = ({ announcements, onRead }: Props) => {
    return (
        <div>
            {announcements.map(announcement => (
                <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onRead={onRead}                
                />
            ))}
        </div>
    )
}

export default AnnouncementList