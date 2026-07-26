import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import type { Project } from '../types/project'
import type { Patient } from '../types/patient'
import type { Category } from '../types/category'
import type { User } from '../types/user'
import type { Priority, TaskStatus } from '../types/task'
import { roleLabel, roleOrder } from '../utils/role'
import { createTask } from '../api/tasks'
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

// ------------------------------------------------------------
// レイアウト用の styled（PatientCreatePage / AnnouncementCreatePage と同じ思想でページローカル）
// ------------------------------------------------------------

const Column = styled.div`
    max-width: 760px;
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

const FormCard = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
`

const Grid2 = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${props => props.theme.spacing.lg};

    /* md 未満（<768px）はフォームの複数列を 1 列に */
    @media (max-width: ${props => props.theme.breakpoints.md}) {
        grid-template-columns: 1fr;
    }
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

// 本文用 textarea（AnnouncementCreatePage と同じ流儀）
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

// チェックボックス付きラベル（全員割当・担当者リスト共通）
const CheckLabel = styled.label`
    display: inline-flex;
    align-items: center;
    gap: ${props => props.theme.spacing.xs};
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.colors.text.primary};
    cursor: pointer;
`

// 担当者リストの外枠：部署ごとのセクションを縦に積む器
const AssigneeList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    padding: ${props => props.theme.spacing.md};
    background: ${props => props.theme.colors.surface.sunken};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.md};
`

// 部署セクション：見出し ＋ その部署の担当者チェック行
const DeptSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
`

// 部署見出し
const DeptHeading = styled.div`
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.secondary};
`

// その部署の担当者を敷き詰め＋折り返し。見出しの下に少しインデント
const DeptRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${props => props.theme.spacing.md};
    padding-left: ${props => props.theme.spacing.sm};
`

// 「全員割当のとき担当者リストを薄く見せる」の視覚キュー（機能はそのまま）
const AssigneeListArea = styled.div<{ $disabled: boolean }>`
    opacity: ${props => props.$disabled ? 0.5 : 1};
    pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
`

const TaskCreatePage = () => {
    // 患者詳細ページの「タスク作成」から遷移した場合、?patientId=... で対象患者が渡ってくる。
    // その値を対象患者の初期値にする（初回のみ評価。以降はユーザーの選択を尊重する）
    const [searchParams] = useSearchParams()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [projectId, setProjectId] = useState<number | null>(null)
    const [categoryId, setCategoryId] = useState<number | null>(null)
    const [patientId, setPatientId] = useState<number | null>(() => {
        const fromQuery = searchParams.get('patientId')
        return fromQuery ? Number(fromQuery) : null
    })
    const [assignedToAll, setAssignedToAll] = useState(false)
    const [priority, setPriority] = useState<Priority>('MEDIUM')
    const [taskStatus, setTaskStatus] = useState<TaskStatus>('CREATED')
    const [dueDate, setDueDate] = useState('')
    const [assigneeIds, setAssigneeIds] = useState<number[]>([])
    const [errorMessage, setErrorMessage] = useState<string>('')

    const [projects, setProjects] = useState<Project[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [userList, setUserList] = useState<User[]>([])

    const navigate = useNavigate()

    // 担当者チェックボックスのオン/オフを配列 state に反映
    const handleAssigneeChange = (userId: number, checked: boolean) => {
        setAssigneeIds(prev =>
            checked ? [...prev, userId] : prev.filter(id => id !== userId)
        )
    }

    // 送信処理：成功時は /tasks へ、失敗時はエラーメッセージを表示する
    const handleSubmit = async () => {
        setErrorMessage('')
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
                assigneeIds: assigneeIds,
            })
            navigate('/tasks')
        } catch (error) {
            setErrorMessage((error as Error).message)
        }
    }

    useEffect(() => {
        fetchProjects().then(setProjects)
        fetchPatients().then(setPatients)
        fetchCategories().then(setCategories)
        fetchUsers().then(setUserList)
    }, [])

    // Select 用 options
    const projectOptions = projects.map(p => ({ value: String(p.id), label: p.projectName }))
    const categoryOptions = categories.map(c => ({ value: String(c.id), label: c.categoryName }))
    // 患者はフルネームで表示（既存は lastName のみだった）。フルネーム化は表示改善
    const patientOptions = patients.map(p => ({
        value: String(p.id),
        label: `${p.lastName} ${p.firstName}`,
    }))

    // 担当者を「部署別」にまとめる。各部署内は「職種順」に並べて職種のかたまりも分かるようにする。
    // 部署は id 昇順（未所属は最後）。→ 誰がどの部署・職種か一目で選べる。
    const assigneesByDept = useMemo(() => {
        const NO_DEPT = -1
        const groups = new Map<number, { name: string; users: User[] }>()
        userList.forEach(user => {
            const key = user.department?.id ?? NO_DEPT
            const name = user.department?.departmentName ?? '未所属'
            if (!groups.has(key)) groups.set(key, { name, users: [] })
            groups.get(key)!.users.push(user)
        })
        // 部署の並び：id 昇順、未所属は末尾
        const ordered = Array.from(groups.entries())
            .sort(([a], [b]) => (a === NO_DEPT ? 1 : b === NO_DEPT ? -1 : a - b))
            .map(([, v]) => v)
        // 各部署内：職種順（医師→看護師→…）→ 同姓など安定のため id
        ordered.forEach(g =>
            g.users.sort((a, b) => (roleOrder[a.role] - roleOrder[b.role]) || a.id - b.id)
        )
        return ordered
    }, [userList])

    return (
        <Column>
            {/* 戻るリンク */}
            <BackLink to="/tasks">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6"
                          stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                全タスクへ戻る
            </BackLink>

            <PageHeader title="タスクを作成" />

            <FormCard>
                {/* タスク名 */}
                <FormField label="タスク名" htmlFor="task-title">
                    <Input
                        id="task-title"
                        type="text"
                        placeholder="タスクのタイトルを入力"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </FormField>

                {/* 詳細（textarea） */}
                <FormField label="詳細" htmlFor="task-description">
                    <Textarea
                        id="task-description"
                        rows={6}
                        placeholder="タスクの詳細を入力"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </FormField>

                {/* 対象患者 / カテゴリ：2列 */}
                <Grid2>
                    <FormField label="対象患者" htmlFor="task-patient">
                        <Select
                            id="task-patient"
                            placeholder="選択してください"
                            options={patientOptions}
                            value={patientId === null ? '' : String(patientId)}
                            onChange={(e) => setPatientId(e.target.value === '' ? null : Number(e.target.value))}
                        />
                    </FormField>
                    <FormField label="カテゴリ" htmlFor="task-category">
                        <Select
                            id="task-category"
                            placeholder="選択してください"
                            options={categoryOptions}
                            value={categoryId === null ? '' : String(categoryId)}
                            onChange={(e) => setCategoryId(e.target.value === '' ? null : Number(e.target.value))}
                        />
                    </FormField>
                </Grid2>

                {/* プロジェクト（デザインにはないが既存機能維持のため残す・1列） */}
                <FormField label="プロジェクト" htmlFor="task-project">
                    <Select
                        id="task-project"
                        placeholder="選択してください"
                        options={projectOptions}
                        value={projectId === null ? '' : String(projectId)}
                        onChange={(e) => setProjectId(e.target.value === '' ? null : Number(e.target.value))}
                    />
                </FormField>

                {/* ステータス / 優先度：2列 */}
                <Grid2>
                    <FormField label="ステータス" htmlFor="task-status">
                        <TaskStatusSelect
                            id="task-status"
                            value={taskStatus}
                            onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                        />
                    </FormField>
                    <FormField label="優先度" htmlFor="task-priority">
                        <PrioritySelect
                            id="task-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Priority)}
                        />
                    </FormField>
                </Grid2>

                {/* 期限（1列） */}
                <FormField label="期限" htmlFor="task-dueDate">
                    <Input
                        id="task-dueDate"
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </FormField>

                {/* 全員に割り当て（チェック時、下の担当者リストは薄く disabled 見た目に） */}
                <CheckLabel>
                    <input
                        type="checkbox"
                        checked={assignedToAll}
                        onChange={(e) => setAssignedToAll(e.target.checked)}
                    />
                    全員に割り当てる
                </CheckLabel>

                {/* 担当者（複数選択・checkbox リスト） */}
                <FormField label="担当者" htmlFor="task-assignees">
                    <AssigneeListArea $disabled={assignedToAll}>
                        <AssigneeList id="task-assignees">
                            {assigneesByDept.map(group => (
                                <DeptSection key={group.name}>
                                    <DeptHeading>{group.name}</DeptHeading>
                                    <DeptRow>
                                        {group.users.map(user => (
                                            <CheckLabel key={user.id}>
                                                <input
                                                    type="checkbox"
                                                    checked={assigneeIds.includes(user.id)}
                                                    onChange={(e) => handleAssigneeChange(user.id, e.target.checked)}
                                                    disabled={assignedToAll}
                                                />
                                                {user.lastName} {user.firstName}（{roleLabel[user.role]}）
                                            </CheckLabel>
                                        ))}
                                    </DeptRow>
                                </DeptSection>
                            ))}
                        </AssigneeList>
                    </AssigneeListArea>
                </FormField>

                {/* エラー */}
                {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

                {/* ボタン列 */}
                <Actions>
                    <Button variant="secondary" onClick={() => navigate('/tasks')}>
                        キャンセル
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        作成する
                    </Button>
                </Actions>
            </FormCard>
        </Column>
    )
}

export default TaskCreatePage
