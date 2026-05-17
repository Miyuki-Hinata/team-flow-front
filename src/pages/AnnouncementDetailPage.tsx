import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import type { Announcement } from "../types/announcement"
import { getAnnouncementById as fetchAnnouncement } from "../api/announcements"

const AnnouncementDetailPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    const [announcement, setAnnouncement] = useState<Announcement | null>(null)

    useEffect(() => {
        fetchAnnouncement(Number(id))
            .then(data => {
                setAnnouncement(data)
            })
            .catch((error) => {
                alert(error.message)
                navigate('/announcements')
            })
    }, [])

    return (
        <div>
            {announcement?(
                <div>
                    <h1>{announcement.title}</h1>
                    <span>{announcement.description}</span>
                    <span>{announcement.project?.projectName}</span>
                    <span>{announcement.category?.categoryName}</span>
                    <span>{announcement.department?.departmentName}</span>
                    <span>{announcement.priority}</span>
                </div>
            ): (
                <p>読み込み中...</p>
            )}
        </div>
    )
}

export default AnnouncementDetailPage