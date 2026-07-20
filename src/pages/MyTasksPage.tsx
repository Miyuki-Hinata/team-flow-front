import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Task, Priority, TaskStatus } from '../types/task'
import type { Patient } from '../types/patient'
import { getMyTasks as fetchMyTasks } from '../api/tasks'
import TaskList from '../components/TaskList'
import TaskFilter from '../components/TaskFilter'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Loading } from '../components/ui/Loading'

// ------------------------------------------------------------
// レイアウト
// ------------------------------------------------------------

// フィルタと患者別セクション群を縦に積む。他一覧と同じ標準余白 spacing.md で揃えて一体感を出す
const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
`

// 患者ごとのセクション。見出し + タスクリスト を縦積み
const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

// セクション見出しの器：患者名（リンク） + 件数バッジ を横並び
const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
`

// 患者名リンク：詳細ページへ遷移。<a> 既定の下線・紫を打ち消し、theme で色/サイズを揃える。
// 患者未指定セクション用に、素の span 見出しでも同じ大きさで揃うようにフォントは Header 側で管理
const PatientLink = styled(Link)`
    text-decoration: none;
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};

    &:hover {
        color: ${props => props.theme.colors.brand.teal};
    }
`

// 患者未指定用の見出し：リンクにしない・同じ見た目を保つ
const NoPatientHeading = styled.span`
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.secondary};
`

// 件数バッジ：小さめの補助表示。「N 件」を控えめに添える
const CountBadge = styled.span`
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
`

// 「＋ タスクを作成」ボタンのアイコン（他一覧ページと同一）
const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

// グルーピング結果の型。patient が null なら「患者未指定」セクション
type PatientGroup = {
    patient: Patient | null
    tasks: Task[]
}

// 「患者未指定」を表す予約キー。number と衝突しない文字列にする
const NO_PATIENT_KEY = '__no_patient__'

const MyTasksPage = () => {
    const navigate = useNavigate()

    // null は「未取得」を意味する（Loading 表示切替のマーカー）
    const [tasks, setTasks] = useState<Task[] | null>(null)

    // フィルタ状態は従来の TaskListContainer から移管。null は「絞り込みなし」を意味する
    const [filterStatus, setFilterStatus] = useState<TaskStatus | null>(null)
    const [filterPriority, setFilterPriority] = useState<Priority | null>(null)

    useEffect(() => {
        fetchMyTasks().then(setTasks)
    }, [])

    // フィルタ後のタスク（患者別グルーピングの前段）
    const filteredTasks = useMemo(() => {
        if (!tasks) return []
        return tasks.filter(task => {
            const statusMatch = filterStatus === null || task.taskStatus === filterStatus
            const priorityMatch = filterPriority === null || task.priority === filterPriority
            return statusMatch && priorityMatch
        })
    }, [tasks, filterStatus, filterPriority])

    // 患者別グルーピング：Map で挿入順を保ちつつ患者 ID ごとに集約する。
    // 「担当患者ビュー」の中核ロジック。朝一の受け持ち患者を選ぶ用途で使う想定
    const groups = useMemo<PatientGroup[]>(() => {
        const map = new Map<number | string, PatientGroup>()
        filteredTasks.forEach(task => {
            const key = task.patient?.id ?? NO_PATIENT_KEY
            if (!map.has(key)) {
                map.set(key, { patient: (task.patient as Patient | undefined) ?? null, tasks: [] })
            }
            map.get(key)!.tasks.push(task)
        })
        return Array.from(map.values())
    }, [filteredTasks])

    // subtitle 用に件数を算出（フィルタ前の全体像を伝える）
    const totalCount = tasks?.length ?? 0
    const openCount = tasks?.filter(t => t.taskStatus !== 'DONE').length ?? 0

    // 未取得は Loading（fetch 完了後は空配列でも Container を描画して EmptyState を出す）
    if (tasks === null) {
        return <Loading />
    }

    return (
        <div>
            <PageHeader
                title="マイタスク"
                subtitle={`全 ${totalCount} 件 ・ 未完 ${openCount} 件`}
                action={
                    <Button variant="primary" onClick={() => navigate('/tasks/create')}>
                        <PlusIcon />
                        タスクを作成
                    </Button>
                }
            />

            <Container>
                {/* フィルタ：状態・優先度は従来どおり。適用後は全セクションのタスクが同じ条件で絞られる */}
                <TaskFilter
                    status={filterStatus}
                    priority={filterPriority}
                    onStatusChange={setFilterStatus}
                    onPriorityChange={setFilterPriority}
                />

                {/* 患者別セクション。フィルタ後の結果が 0 件なら全体としての EmptyState を1つだけ出す */}
                {groups.length === 0 ? (
                    <EmptyState message="表示するタスクはありません" />
                ) : (
                    groups.map(({ patient, tasks }) => (
                        <Section key={patient?.id ?? NO_PATIENT_KEY}>
                            <SectionHeader>
                                {/* 患者ありは詳細ページへリンク、なしは非リンクの見出しに切替 */}
                                {patient ? (
                                    <PatientLink to={`/patients/${patient.id}`}>
                                        {patient.lastName} {patient.firstName} さん
                                    </PatientLink>
                                ) : (
                                    <NoPatientHeading>患者未指定</NoPatientHeading>
                                )}
                                <CountBadge>{tasks.length} 件</CountBadge>
                            </SectionHeader>
                            <TaskList tasks={tasks} />
                        </Section>
                    ))
                )}
            </Container>
        </div>
    )
}

export default MyTasksPage
