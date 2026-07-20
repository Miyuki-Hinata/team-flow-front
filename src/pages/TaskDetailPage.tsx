import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import type { Task, Priority, TaskStatus } from '../types/task'
import type { TaskHistory } from '../types/taskHistory'
import type { Project } from '../types/project'
import type { Patient } from '../types/patient'
import type { Category } from '../types/category'
import type { User } from '../types/user'
import { deleteTask, getTaskById as fetchTask, updateTask, getTaskHistories } from '../api/tasks'
import { projects as fetchProjects } from '../api/projects'
import { patients as fetchPatients } from '../api/patients'
import { categories as fetchCategories } from '../api/categories'
import { users as fetchUsers } from '../api/users'
import { PageHeader } from '../components/ui/PageHeader'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { PrioritySelect } from '../components/ui/PrioritySelect'
import { TaskStatusSelect } from '../components/ui/TaskStatusSelect'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { PriorityBadge } from '../components/ui/PriorityBadge'
import { StatusBadge } from '../components/ui/StatusBadge'
import { HistoryList } from '../components/ui/HistoryList'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Loading } from '../components/ui/Loading'
import { formatDueDate } from '../utils/task'
import { getCategoryTone } from '../utils/category'
import { useToast } from '../contexts/ToastContext'

// ------------------------------------------------------------
// レイアウト（README §Design Tokens「タスク詳細/編集は 880px」）
// ------------------------------------------------------------

const Column = styled.div`
    max-width: 880px;
    margin: 0 auto;
`

const BackLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: ${props => props.theme.spacing.xs};
    text-decoration: none;
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.fontSize.sm};
    margin-bottom: ${props => props.theme.spacing.md};

    &:hover {
        color: ${props => props.theme.colors.text.primary};
    }
`

// 詳細表示の白カード（AnnouncementDetailPage と同じ流儀）
const DetailCard = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    margin-bottom: ${props => props.theme.spacing.xl};
`

const TopRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${props => props.theme.spacing.md};
    flex-wrap: wrap;
`

const BadgeRow = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.sm};
    align-items: center;
    flex-wrap: wrap;
`

const ActionRow = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.sm};
`

const Title = styled.h1`
    margin: 0;
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// ステータス変更行：デザインどおり「沈んだ面」に配置してクイックアクションと分かる見た目に
const StatusChangeBar = styled.div`
    background: ${props => props.theme.colors.surface.sunken};
    border-radius: ${props => props.theme.radius.md};
    padding: ${props => props.theme.spacing.md};
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.md};
    flex-wrap: wrap;
`

const StatusChangeLabel = styled.span`
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
    font-weight: ${props => props.theme.fontWeight.bold};
`

const StatusChangeHint = styled.span`
    font-size: ${props => props.theme.fontSize.xs};
    color: ${props => props.theme.colors.text.muted};
`

// 情報グリッド（対象患者 / 担当者 / 期限 / プロジェクト を並べる 2 列）。md 未満は 1 列
const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${props => props.theme.spacing.md};

    @media (max-width: ${props => props.theme.breakpoints.md}) {
        grid-template-columns: 1fr;
    }
`

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
`

const InfoLabel = styled.span`
    font-size: ${props => props.theme.fontSize.xs};
    color: ${props => props.theme.colors.text.muted};
    font-weight: ${props => props.theme.fontWeight.bold};
`

const InfoValue = styled.span`
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.colors.text.primary};
`

// 本文
const Body = styled.div`
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.colors.text.primary};
    white-space: pre-wrap;
    line-height: ${props => props.theme.lineHeight.normal};
`

// ============ 編集モード ============

const FormCard = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
    margin-bottom: ${props => props.theme.spacing.xl};
`

const Grid2 = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${props => props.theme.spacing.lg};
`

const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${props => props.theme.spacing.sm};
`

const ErrorText = styled.p`
    margin: 0;
    color: ${props => props.theme.colors.semantic.danger.main};
    font-size: ${props => props.theme.fontSize.xs};
`

const Textarea = styled.textarea`
    background: ${props => props.theme.colors.surface.sunken};
    color: ${props => props.theme.colors.text.primary};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.md};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    font-size: ${props => props.theme.fontSize.md};
    font-family: inherit;
    resize: vertical;
    min-height: 128px;

    &::placeholder {
        color: ${props => props.theme.colors.text.muted};
    }
    &:focus {
        outline: none;
        border-color: ${props => props.theme.colors.brand.teal};
    }
`

const CheckLabel = styled.label`
    display: inline-flex;
    align-items: center;
    gap: ${props => props.theme.spacing.xs};
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.colors.text.primary};
    cursor: pointer;
`

const AssigneeList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${props => props.theme.spacing.md};
    padding: ${props => props.theme.spacing.md};
    background: ${props => props.theme.colors.surface.sunken};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.md};
`

const AssigneeListArea = styled.div<{ $disabled: boolean }>`
    opacity: ${props => props.$disabled ? 0.5 : 1};
    pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
`

const TaskDetailPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const toast = useToast()
    // 遷移元を state から読み取り、戻るリンクを動的に切り替える。
    // 例：KanbanBoard（患者詳細）から来た場合は「患者詳細へ戻る」に、無ければ既定の「全タスクへ戻る」に。
    const location = useLocation()
    const fromPath = (location.state as { from?: string } | null)?.from
    const isFromPatient = !!fromPath && fromPath.startsWith('/patients/')
    const backTo = fromPath ?? '/tasks'
    const backLabel = isFromPatient ? '患者詳細へ戻る' : '全タスクへ戻る'

    const [task, setTask] = useState<Task | null>(null)
    const [histories, setHistories] = useState<TaskHistory[]>([])
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>('')

    // 編集フォーム用 state
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

    // 詳細 → 編集モードへ切り替え。現状値を編集フォームにコピー
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
        setErrorMessage('')
        setIsEditing(true)
    }

    const handleSave = async () => {
        setErrorMessage('')
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
            setErrorMessage((error as Error).message)
        }
    }

    // ステータスクイック変更：既存挙動どおり、その場で更新＋履歴再読込
    const handleStatusChange = async (newStatus: TaskStatus) => {
        if (!task) return
        try {
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
                assigneeIds: task.assignees?.map(a => a.id),
            })
            setTask(prev => prev ? { ...prev, taskStatus: newStatus } : null)
            await loadHistories()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    // 削除：ConfirmDialog で OK 押下後に呼ばれる
    const handleDelete = async () => {
        try {
            await deleteTask(Number(id))
            toast.success('タスクを削除しました')
            navigate('/tasks')
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const handleAssigneeChange = (userId: number, checked: boolean) => {
        setEditAssigneeIds(prev =>
            checked ? [...prev, userId] : prev.filter(uid => uid !== userId)
        )
    }

    useEffect(() => {
        Promise.all([loadTask(), loadHistories()]).catch((error) => {
            toast.error(error.message)
            navigate('/tasks')
        })
        fetchProjects().then(setProjects)
        fetchCategories().then(setCategories)
        fetchPatients().then(setPatients)
        fetchUsers().then(setUserList)
    }, [])

    if (!task) {
        return (
            <Column>
                <Loading />
            </Column>
        )
    }

    // Select 用 options
    const projectOptions = projects.map(p => ({ value: String(p.id), label: p.projectName }))
    const categoryOptions = categories.map(c => ({ value: String(c.id), label: c.categoryName }))
    const patientOptions = patients.map(p => ({
        value: String(p.id),
        label: `${p.lastName} ${p.firstName}`,
    }))

    // 詳細モードの情報表示用の整形
    const patientDisplay = task.patient
        ? `${task.patient.lastName} ${task.patient.firstName}`
        : '-'
    const assigneesDisplay = task.assignedToAll
        ? '全員'
        : (task.assignees?.length
            ? task.assignees.map(a => `${a.lastName} ${a.firstName}`).join('、')
            : '-')
    const dueDateDisplay = task.dueDate ? formatDueDate(task.dueDate) : '-'
    const projectDisplay = task.project?.projectName ?? '-'

    return (
        <Column>
            <BackLink to={backTo}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6"
                          stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {backLabel}
            </BackLink>

            {isEditing ? (
                // ============ 編集モード ============
                <>
                    <PageHeader title="タスクを編集" />
                    <FormCard>
                        <FormField label="タスク名" htmlFor="task-edit-title">
                            <Input
                                id="task-edit-title"
                                type="text"
                                placeholder="タスクのタイトルを入力"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </FormField>

                        <FormField label="詳細" htmlFor="task-edit-description">
                            <Textarea
                                id="task-edit-description"
                                rows={6}
                                placeholder="タスクの詳細を入力"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                        </FormField>

                        <Grid2>
                            <FormField label="対象患者" htmlFor="task-edit-patient">
                                <Select
                                    id="task-edit-patient"
                                    placeholder="選択してください"
                                    options={patientOptions}
                                    value={editPatientId === null ? '' : String(editPatientId)}
                                    onChange={(e) => setEditPatientId(e.target.value === '' ? null : Number(e.target.value))}
                                />
                            </FormField>
                            <FormField label="カテゴリ" htmlFor="task-edit-category">
                                <Select
                                    id="task-edit-category"
                                    placeholder="選択してください"
                                    options={categoryOptions}
                                    value={editCategoryId === null ? '' : String(editCategoryId)}
                                    onChange={(e) => setEditCategoryId(e.target.value === '' ? null : Number(e.target.value))}
                                />
                            </FormField>
                        </Grid2>

                        <FormField label="プロジェクト" htmlFor="task-edit-project">
                            <Select
                                id="task-edit-project"
                                placeholder="選択してください"
                                options={projectOptions}
                                value={editProjectId === null ? '' : String(editProjectId)}
                                onChange={(e) => setEditProjectId(e.target.value === '' ? null : Number(e.target.value))}
                            />
                        </FormField>

                        <Grid2>
                            <FormField label="ステータス" htmlFor="task-edit-status">
                                <TaskStatusSelect
                                    id="task-edit-status"
                                    value={editTaskStatus}
                                    onChange={(e) => setEditTaskStatus(e.target.value as TaskStatus)}
                                />
                            </FormField>
                            <FormField label="優先度" htmlFor="task-edit-priority">
                                <PrioritySelect
                                    id="task-edit-priority"
                                    value={editPriority}
                                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                                />
                            </FormField>
                        </Grid2>

                        <FormField label="期限" htmlFor="task-edit-dueDate">
                            <Input
                                id="task-edit-dueDate"
                                type="datetime-local"
                                value={editDueDate}
                                onChange={(e) => setEditDueDate(e.target.value)}
                            />
                        </FormField>

                        <CheckLabel>
                            <input
                                type="checkbox"
                                checked={editAssignedToAll}
                                onChange={(e) => setEditAssignedToAll(e.target.checked)}
                            />
                            全員に割り当てる
                        </CheckLabel>

                        <FormField label="担当者" htmlFor="task-edit-assignees">
                            <AssigneeListArea $disabled={editAssignedToAll}>
                                <AssigneeList id="task-edit-assignees">
                                    {userList.map(user => (
                                        <CheckLabel key={user.id}>
                                            <input
                                                type="checkbox"
                                                checked={editAssigneeIds.includes(user.id)}
                                                onChange={(e) => handleAssigneeChange(user.id, e.target.checked)}
                                                disabled={editAssignedToAll}
                                            />
                                            {user.lastName} {user.firstName}
                                        </CheckLabel>
                                    ))}
                                </AssigneeList>
                            </AssigneeListArea>
                        </FormField>

                        {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

                        <Actions>
                            <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                キャンセル
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                保存する
                            </Button>
                        </Actions>
                    </FormCard>
                </>
            ) : (
                // ============ 詳細表示モード ============
                <DetailCard>
                    <TopRow>
                        <BadgeRow>
                            <StatusBadge status={task.taskStatus} />
                            <PriorityBadge priority={task.priority} />
                            {task.category?.categoryName && (
                                <Badge tone={getCategoryTone(task.category.categoryName)}>
                                    {task.category.categoryName}
                                </Badge>
                            )}
                        </BadgeRow>

                        <ActionRow>
                            <Button variant="secondary" onClick={enterEditMode}>編集</Button>
                            <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>削除</Button>
                        </ActionRow>
                    </TopRow>

                    <Title>{task.title}</Title>

                    {/* ステータスクイック変更行 */}
                    <StatusChangeBar>
                        <StatusChangeLabel>ステータス変更</StatusChangeLabel>
                        <TaskStatusSelect
                            value={task.taskStatus}
                            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                        />
                        <StatusChangeHint>変更すると履歴に記録されます</StatusChangeHint>
                    </StatusChangeBar>

                    {/* 対象患者 / 担当者 / 期限 / プロジェクト の 2 列表示 */}
                    <InfoGrid>
                        <InfoItem>
                            <InfoLabel>対象患者</InfoLabel>
                            <InfoValue>{patientDisplay}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>担当者</InfoLabel>
                            <InfoValue>{assigneesDisplay}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>期限</InfoLabel>
                            <InfoValue>{dueDateDisplay}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>プロジェクト</InfoLabel>
                            <InfoValue>{projectDisplay}</InfoValue>
                        </InfoItem>
                    </InfoGrid>

                    {/* 詳細本文 */}
                    {task.description && <Body>{task.description}</Body>}
                </DetailCard>
            )}

            {/* 変更履歴（TaskHistory は HistoryEntry と互換） */}
            <HistoryList histories={histories} />

            {/* 削除確認ダイアログ */}
            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={() => {
                    setIsDeleteOpen(false)
                    handleDelete()
                }}
                message="このタスクを削除しますか？"
            />
        </Column>
    )
}

export default TaskDetailPage
