import { useState, useEffect } from 'react'
import type { Project } from '../types/project'
import type { Patient } from '../types/patient'
import type { Category } from '../types/category'
import type { User } from '../types/user'
import { createTask } from '../api/tasks'
import { projects as fetchProjects } from '../api/projects'
import { patients as fetchPatients } from '../api/patients'
import { categories as fetchCategories } from '../api/categories'
import { users as fetchUsers } from '../api/users'
import { useNavigate } from 'react-router-dom'

const TaskCreatePage = () => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [projectId, setProjectId] = useState<number | null>(null)
    const [categoryId, setCategoryId] = useState<number | null>(null)
    const [patientId, setPatientId] = useState<number | null>(null)
    const [assignedToAll, setAssignToAll] = useState(false)
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
    const [taskStatus, setTaskStatus] = useState<'CREATED' | 'PROGRESS' | 'REVIEWING' | 'DONE'>('CREATED')
    const [dueDate, setDueDate] = useState('')
    const [assigneeIds, setAssigneeIds] = useState<number[]>([])

    const [projects, setProjects] = useState<Project[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [userList, setUserList] = useState<User[]>([])

    const navigate = useNavigate()

    const handleAssigneeChange = (userId: number, checked: boolean) => {
        setAssigneeIds(prev =>
            checked ? [...prev, userId] : prev.filter(id => id !== userId)
        )
    }

    const handleSubmit = async () => {
        try {
            await createTask({
                title: title,
                description: description,
                projectId: projectId ?? undefined,
                categoryId: categoryId ?? undefined,
                patientId: patientId ?? undefined,
                assignedToAll: assignedToAll,
                priority: priority,
                taskStatus: taskStatus,
                dueDate: dueDate ? `${dueDate}:00` : undefined,
                assigneeIds: assigneeIds
            })
            navigate('/tasks')
        } catch (error) {
            alert((error as Error).message)
        }
    }

    useEffect(() => {
        fetchProjects().then(data => setProjects(data))
        fetchPatients().then(data => setPatients(data))
        fetchCategories().then(data => setCategories(data))
        fetchUsers().then(data => setUserList(data))
    }, [])


    return (
        <div>
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
                value={patientId ?? ''}
                onChange={(e) => setPatientId(Number(e.target.value) || null)}
            >
                <option value="">患者名を選択</option>
                {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.lastName}</option>
                ))}
            </select>

            <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as 'CREATED' | 'PROGRESS' | 'REVIEWING' | 'DONE')}
            >
                <option value="CREATED">未着手</option>
                <option value="PROGRESS">進行中</option>
                <option value="REVIEWING">レビュー中</option>
                <option value="DONE">完了</option>
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
                <input
                    type="checkbox"
                    checked={assignedToAll}
                    onChange={(e) => setAssignToAll(e.target.checked)}
                />
                全員に割り当て
            </label>

            <div>
                <p>担当者</p>
                {userList.map(user => (
                    <label key={user.id}>
                        <input
                            type="checkbox"
                            checked={assigneeIds.includes(user.id)}
                            onChange={(e) => handleAssigneeChange(user.id, e.target.checked)}
                        />
                        {user.lastName} {user.firstName}
                    </label>
                ))}
            </div>

            <label>
                期限
                <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
            </label>

            <button onClick={handleSubmit}>作成</button>
        </div>
    )
}

export default TaskCreatePage
