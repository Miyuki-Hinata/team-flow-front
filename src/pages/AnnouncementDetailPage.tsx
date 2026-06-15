import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import type { Announcement } from "../types/announcement"
import type { AnnouncementHistory } from "../types/announcementHistory"
import type { Project } from "../types/project"
import type { Category } from "../types/category"
import type { Department } from "../types/department"
import { getAnnouncementById as fetchAnnouncement, getAnnouncementHistories, updateAnnouncement, deleteAnnouncement } from "../api/announcements"
import { projects as fetchProjects } from '../api/projects'
import { categories as fetchCategories } from '../api/categories'
import { departments as fetchDepartments } from '../api/departments'
import { useAuth } from "../contexts/AuthContext"

const AnnouncementDetailPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { currentUser } = useAuth()

    const [announcement, setAnnouncement] = useState<Announcement | null>(null)
    const [histories, setHistories] = useState<AnnouncementHistory[]>([])
    const [isEditing, setIsEditing] = useState(false)

    // 編集フォーム用state
    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editProjectId, setEditProjectId] = useState<number | null>(null)
    const [editCategoryId, setEditCategoryId] = useState<number | null>(null)
    const [editDepartmentId, setEditDepartmentId] = useState<number | null>(null)
    const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
    const [editExpiredAt, setEditExpiredAt] = useState('')

    // ドロップダウン用データ
    const [projects, setProjects] = useState<Project[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [departments, setDepartments] = useState<Department[]>([])

    const loadAnnouncement = async () => {
        const data = await fetchAnnouncement(Number(id))
        setAnnouncement(data)
    }

    const loadHistories = async () => {
        const data = await getAnnouncementHistories(Number(id))
        setHistories(data)
    }

    const enterEditMode = () => {
        if (!announcement) return
        setEditTitle(announcement.title)
        setEditDescription(announcement.description || '')
        setEditProjectId(announcement.project?.id ?? null)
        setEditCategoryId(announcement.category?.id ?? null)
        setEditDepartmentId(announcement.department?.id ?? null)
        setEditPriority(announcement.priority)
        setEditExpiredAt(announcement.expiredAt ? announcement.expiredAt.substring(0, 16) : '')
        setIsEditing(true)
    }

    const handleSave = async () => {
        try {
            await updateAnnouncement(Number(id), {
                title: editTitle,
                description: editDescription,
                projectId: editProjectId ?? undefined,
                categoryId: editCategoryId ?? undefined,
                departmentId: editDepartmentId ?? undefined,
                priority: editPriority,
                expiredAt: editExpiredAt ? `${editExpiredAt}:00` : undefined,
            })
            await loadAnnouncement()
            await loadHistories()
            setIsEditing(false)
        } catch (error) {
            alert((error as Error).message)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteAnnouncement(Number(id))
            alert('お知らせを削除しました')
            navigate('/announcements')
        } catch (error) {
            alert((error as Error).message)
        }
    }

    useEffect(() => {
        Promise.all([loadAnnouncement(), loadHistories()]).catch((error) => {
            alert(error.message)
            navigate('/announcements')
        })
        fetchProjects().then(setProjects)
        fetchCategories().then(setCategories)
        fetchDepartments().then(setDepartments)
    }, [])

    if (!announcement) return <p>読み込み中...</p>

    const canEdit = !!currentUser && !!announcement.createdBy
        && (currentUser.id === announcement.createdBy.id || currentUser.admin)

    return (
        <div>
            {isEditing ? (
                <div>
                    <h1>お知らせ編集</h1>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="タイトル"
                    />
                    <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="詳細"
                    />
                    <select
                        value={editProjectId ?? ''}
                        onChange={(e) => setEditProjectId(Number(e.target.value) || null)}
                    >
                        <option value="">プロジェクトを選択</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.projectName}</option>
                        ))}
                    </select>
                    <select
                        value={editCategoryId ?? ''}
                        onChange={(e) => setEditCategoryId(Number(e.target.value) || null)}
                    >
                        <option value="">カテゴリーを選択</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.categoryName}</option>
                        ))}
                    </select>
                    <select
                        value={editDepartmentId ?? ''}
                        onChange={(e) => setEditDepartmentId(Number(e.target.value) || null)}
                    >
                        <option value="">全体（部署を限定しない）</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.departmentName}</option>
                        ))}
                    </select>
                    <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                    >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                    </select>
                    <label>
                        掲載終了日時
                        <input
                            type="datetime-local"
                            value={editExpiredAt}
                            onChange={(e) => setEditExpiredAt(e.target.value)}
                        />
                    </label>
                    <button onClick={handleSave}>保存</button>
                    <button onClick={() => setIsEditing(false)}>キャンセル</button>
                </div>
            ) : (
                <div>
                    <h1>{announcement.title}</h1>
                    <span>{announcement.description}</span>
                    <span>{announcement.project?.projectName}</span>
                    <span>{announcement.category?.categoryName}</span>
                    <span>{announcement.department?.departmentName ?? '全体'}</span>
                    <span>{announcement.priority}</span>
                    {canEdit && (
                        <div>
                            <button onClick={enterEditMode}>編集</button>
                            <button onClick={handleDelete}>削除</button>
                        </div>
                    )}
                </div>
            )}

            <div>
                <h2>変更履歴</h2>
                {histories.length === 0 ? (
                    <p>変更履歴はありません</p>
                ) : (
                    histories.map(h => (
                        <div key={h.id}>
                            <span>{h.changedAt}</span>
                            <span>{h.changedBy.lastName} {h.changedBy.firstName}</span>
                            <span>{h.fieldName}</span>
                            <span>{h.oldValue ?? '(なし)'} → {h.newValue ?? '(なし)'}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default AnnouncementDetailPage
