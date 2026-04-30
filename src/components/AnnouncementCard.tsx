import type { Announcement } from "../types/announcement";

type Props = {
    announcement: Announcement
    onRead: (id: number) => void
}

const AnnouncementCard = ({ announcement, onRead }: Props) => {
    return (
        <div
            onClick={() => onRead(announcement.id)}
            style={{ background: announcement.isRead ? '#f0f0f0' : '#ffffff' }}
        >
            <h1>{announcement.title}</h1>
            <span>{announcement.category.categoryName}</span>
            <span>{announcement.department.departmentName}</span>
            <span>{announcement.priority}</span>
        </div>
    )

}
export default AnnouncementCard