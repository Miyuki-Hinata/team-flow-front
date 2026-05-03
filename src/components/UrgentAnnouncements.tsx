import type { Announcement } from "../types/announcement"
import AnnouncementCard from "./AnnouncementCard"

type Props = {
    announcements: Announcement[]
    onRead: (id: number) => void
}

const UrgentAnnouncements = ({ announcements, onRead}: Props) => {
    return (
        <div>
            {announcements.filter(a => a.priority === "HIGH" && !a.isRead)
            .map((announcement) => (
               <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onRead={onRead}
               />
            ))}
        </div>
    )
}

export default UrgentAnnouncements