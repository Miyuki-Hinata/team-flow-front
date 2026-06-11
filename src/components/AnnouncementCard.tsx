import type { Announcement } from "../types/announcement";
import { Link } from 'react-router-dom'

type Props = {
    announcement: Announcement
    onRead: (id: number) => void
}

const AnnouncementCard = ({ announcement, onRead }: Props) => {
    return (
        <Link to={`/announcements/${announcement.id}`}>
            <div
                onClick={() => onRead(announcement.id)}
                style={{ background: announcement.isRead ? '#f0f0f0' : '#ffffff' }}
            >
                <h1>{announcement.title}</h1>
                <span>{announcement.category.categoryName}</span>
                <span>{announcement.department?.departmentName ?? '全体'}</span>
                <span>{announcement.priority}</span>
            </div>         
        </Link>
    )

}
export default AnnouncementCard