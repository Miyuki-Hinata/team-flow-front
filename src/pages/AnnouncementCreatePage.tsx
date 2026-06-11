import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../types/project'
import type { Category } from '../types/category'
import type { Department } from '../types/department'
import type { Announcement } from '../types/announcement'
import { createAnnouncement, getMyAnnouncements, deleteAnnouncement } from '../api/announcements'
import { projects as fetchProjects } from '../api/projects'
import { categories as fetchCategories } from '../api/categories'
import { departments as fetchDepartments } from '../api/departments'

const AnnouncementCreatePage = () => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [projectId, setProjectId] = useState<number | null>(null)
    const [categoryId, setCategoryId] = useState<number | null>(null)
    const [departmentId, setDepartmentId] = useState<number | null>(null)
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
    const [expiredAt, setExpiredAt] = useState('')

    const [projects, setProjects] = useState<Project[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([])

    const navigate = useNavigate()

    const loadMyAnnouncements = async () => {
        const data = await getMyAnnouncements()
        setMyAnnouncements(data)
    }

    const handleSubmit = async () => {
        try {
            await createAnnouncement({
                title: title,
                description: description,
                projectId: projectId ?? undefined,
                categoryId: categoryId ?? undefined,
                departmentId: departmentId ?? undefined,
                priority: priority,
                expiredAt: expiredAt ? `${expiredAt}:00` : undefined,
            })
            navigate('/announcements')
        } catch (error) {
            alert((error as Error).message)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteAnnouncement(id)
            await loadMyAnnouncements()
        } catch (error) {
            alert((error as Error).message)
        }
    }

    useEffect(() => {
        fetchProjects().then(setProjects)
        fetchCategories().then(setCategories)
        fetchDepartments().then(setDepartments)
        loadMyAnnouncements()
    }, [])

    return (
        <div>
            <h1>お知らせ作成</h1>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='タイトル'
            />
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='詳細'
            />
            <select
                value={projectId ?? ''}
                onChange={(e) => setProjectId(Number(e.target.value) || null)}
            >
                <option value="">プロジェクトを選択</option>
                {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.projectName}</option>
                ))}
            </select>

            <select
                value={categoryId ?? ''}
                onChange={(e) => setCategoryId(Number(e.target.value) || null)}
            >
                <option value="">カテゴリーを選択</option>
                {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.categoryName}</option>
                ))}
            </select>

            <select
                value={departmentId ?? ''}
                onChange={(e) => setDepartmentId(Number(e.target.value) || null)}
            >
                <option value="">全体（部署を限定しない）</option>
                {departments.map(department => (
                    <option key={department.id} value={department.id}>{department.departmentName}</option>
                ))}
            </select>

            <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
            >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
            </select>

            <label>
                掲載終了日時
                <input
                    type="datetime-local"
                    value={expiredAt}
                    onChange={(e) => setExpiredAt(e.target.value)}
                />
            </label>

            <button onClick={handleSubmit}>作成</button>

            <div>
                <h2>自分が作ったお知らせ一覧</h2>
                {myAnnouncements.length === 0 ? (
                    <p>お知らせはありません</p>
                ) : (
                    myAnnouncements.map(a => (
                        <div key={a.id}>
                            <span>{a.title}</span>
                            <span>{a.category?.categoryName}</span>
                            <span>{a.department?.departmentName}</span>
                            <span>{a.priority}</span>
                            <button onClick={() => handleDelete(a.id)}>削除</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default AnnouncementCreatePage
