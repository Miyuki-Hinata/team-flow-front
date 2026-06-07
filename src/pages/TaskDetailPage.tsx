import { useState, useEffect } from 'react'
import type { Task, Priority, TaskStatus } from '../types/task'
import type { TaskHistory } from '../types/taskHistory'
import type { Project } from '../types/project'
import type { Patient } from '../types/patient'
import type { Category } from '../types/category'
import type { User } from '../types/user'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteTask, getTaskById as fetchTask, updateTask, getTaskHistories } from '../api/tasks'
import { projects as fetchProjects } from '../api/projects'
import { patients as fetchPatients } from '../api/patients'
import { categories as fetchCategories } from '../api/categories'
import { users as fetchUsers } from '../api/users'

const TaskDetailPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    const [task, setTask] = useState<Task | null>(null)
    const [histories, setHistories] = useState<TaskHistory[]>([])
    const [isEditing, setIsEditing] = useState(false)

    // 編集フォーム用state
    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [editProjectId, setEditProjectId] = useState<number | null>(null)
    const [editCategoryId, setEditCategoryId] = useState<number | null>(null)
    const [editPatientId, setEditPatientId] = useState<number | null>(null)
    const [editPriority, setEditPriority] = useState<Priority>('MEDIUM')
    const [editTaskStatus, setEditTaskStatus] = useState<TaskStatus>('CREATED')
    const [editDueDate, setEditDueDate] = useState('')
    const [editAssignedToAll, setEditAssignedToAll] = useState(false)
    const [editAssigneeIds, setEditAssigneeIds] = useState<number[]>([])

    // ドロップダウン用データ
    const [projects, setProjects] = useState<Project[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [userList, setUserList] = useState<User[]>([])

    const loadTask = async () => {
        const data = await fetchTask(Number(id))
        setTask(data)
    }

    const loadHistories = async () => {
        const data = await getTaskHistories(Number(id))
        setHistories(data)
    }

    const enterEditMode = () => {
        if (!task) return
        setEditTitle(task.title)
        setEditDescription(task.description || '')
        setEditProjectId(task.project?.id ?? null)
        setEditCategoryId(task.category?.id ?? null)
        setEditPatientId(task.patient?.id ?? null)
        setEditPriority(task.priority)
        setEditTaskStatus(task.taskStatus)
        setEditDueDate(task.dueDate ? task.dueDate.substring(0, 16) : '')
        setEditAssignedToAll(task.assignedToAll)
        setEditAssigneeIds(task.assignees?.map(a => a.id) ?? [])
        setIsEditing(true)
    }

    const handleSave = async () => {
        try {
            await updateTask(Number(id), {
                title: editTitle,
                description: editDescription,
                projectId: editProjectId ?? undefined,
                categoryId: editCategoryId ?? undefined,
                patientId: editPatientId ?? undefined,
                assignedToAll: editAssignedToAll,
                priority: editPriority,
                taskStatus: editTaskStatus,
                dueDate: editDueDate ? `${editDueDate}:00` : undefined,
                assigneeIds: editAssigneeIds,
            })
            await loadTask()
            await loadHistories()
            setIsEditing(false)
        } catch (error) {
            alert((error as Error).message)
        }
    }

    const handleStatusChange = async (newStatus: TaskStatus) => {
        if (!task) return
        await updateTask(Number(id), {
            title: task.title,
            description: task.description,
            projectId: task.project?.id,
            categoryId: task.category?.id,
            patientId: task.patient?.id,
            assignedToAll: task.assignedToAll,
            priority: task.priority,
            taskStatus: newStatus,
            dueDate: task.dueDate,
            assigneeIds: task.assignees?.map(a => a.id)
        })
        setTask(prev => prev ? { ...prev, taskStatus: newStatus } : null)
        await loadHistories()
    }

    const handleDelete = async () => {
        await deleteTask(Number(id))
        navigate('/tasks')
    }

    const handleAssigneeChange = (userId: number, checked: boolean) => {
        setEditAssigneeIds(prev =>
            checked ? [...prev, userId] : prev.filter(uid => uid !== userId)
        )
    }

    useEffect(() => {
        Promise.all([loadTask(), loadHistories()]).catch((error) => {
            alert(error.message)
            navigate('/tasks')
        })
        fetchProjects().then(setProjects)
        fetchCategories().then(setCategories)
        fetchPatients().then(setPatients)
        fetchUsers().then(setUserList)
    }, [])

    if (!task) return <p>読み込み中...</p>

    return (
        <div>
            {isEditing ? (
                <div>
                    <h1>タスク編集</h1>
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
                        value={editPatientId ?? ''}
                        onChange={(e) => setEditPatientId(Number(e.target.value) || null)}
                    >
                        <option value="">患者名を選択</option>
                        {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.lastName}</option>
                        ))}
                    </select>
                    <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as Priority)}
                    >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                    </select>
                    <select
                        value={editTaskStatus}
                        onChange={(e) => setEditTaskStatus(e.target.value as TaskStatus)}
                    >
                        <option value="CREATED">未着手</option>
                        <option value="PROGRESS">進行中</option>
                        <option value="REVIEWING">レビュー中</option>
                        <option value="DONE">完了</option>
                    </select>
                    <label>
                        <input
                            type="checkbox"
                            checked={editAssignedToAll}
                            onChange={(e) => setEditAssignedToAll(e.target.checked)}
                        />
                        全員に割り当て
                    </label>
                    <label>
                        期限
                        <input
                            type="datetime-local"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                        />
                    </label>
                    <div>
                        <p>担当者</p>
                        {userList.map(user => (
                            <label key={user.id}>
                                <input
                                    type="checkbox"
                                    checked={editAssigneeIds.includes(user.id)}
                                    onChange={(e) => handleAssigneeChange(user.id, e.target.checked)}
                                />
                                {user.lastName} {user.firstName}
                            </label>
                        ))}
                    </div>
                    <button onClick={handleSave}>保存</button>
                    <button onClick={() => setIsEditing(false)}>キャンセル</button>
                </div>
            ) : (
                <div>
                    <h1>{task.title}</h1>
                    <p>{task.description}</p>
                    <span>{task.project?.projectName}</span>
                    <span>{task.project?.department?.departmentName}</span>
                    <span>{task.priority}</span>
                    <span>{task.category?.categoryName}</span>
                    {task.patient && (
                        <span>{task.patient.lastName + task.patient.firstName}</span>
                    )}
                    {task.dueDate && <span>{task.dueDate}</span>}
                    {task.assignees?.map(assignee => (
                        <span key={assignee.id}>{assignee.lastName}</span>
                    ))}
                    <select
                        value={task.taskStatus}
                        onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                    >
                        <option value="CREATED">未着手</option>
                        <option value="PROGRESS">進行中</option>
                        <option value="REVIEWING">レビュー中</option>
                        <option value="DONE">完了</option>
                    </select>
                    <button onClick={enterEditMode}>編集</button>
                    <button onClick={handleDelete}>削除</button>
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

export default TaskDetailPage
