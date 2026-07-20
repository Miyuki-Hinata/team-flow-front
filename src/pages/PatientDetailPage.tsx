import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'
import type { Task } from '../types/task'
import type { Patient } from '../types/patient'
import type { TaskSummaryResponse } from '../types/taskSummary'
import { getPatientById } from '../api/patients'
import { getTasksByPatientId } from '../api/tasks'
import { getTaskSummary, generateTaskSummary } from '../api/taskSummaries'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { AISummaryCard } from '../components/ui/AISummaryCard'
import { KanbanBoard } from '../components/ui/KanbanBoard'
import { PatientIcon } from '../components/ui/PatientIcon'
import { Select } from '../components/ui/Select'
import { Loading } from '../components/ui/Loading'
import { calcAge, getAgeGroup, sexLabel, ageGroupLabel } from '../utils/patient'

type TabType = 'all' | 'category' | 'my'

// ------------------------------------------------------------
// レイアウト
// 詳細ページ用の Column（880px）を採用し、他詳細ページ（AnnouncementDetailPage/TaskDetailPage）と統一感を出す。
// KanbanBoard は自前で overflow-x: auto を持つため、Column 幅を超えても内側で横スクロールできる。
// ------------------------------------------------------------

const Column = styled.div`
    max-width: 880px;
    margin: 0 auto;
`

// 戻るリンク（他詳細ページと同じ流儀）
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

// 患者基本情報カード
const DetailCard = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.xl};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
    margin-bottom: ${props => props.theme.spacing.xl};
`

// アイコン + 名前・カナ・Meta の横並び（PatientCard と同じ思想）
const PatientRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.md};
    width: 100%;
`

const PatientContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing.xs};
    flex: 1 1 auto;
    min-width: 0;
`

// 氏名：詳細ページの主見出しなので xxl / bold
const PatientName = styled.h1`
    margin: 0;
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// 振り仮名
const PatientKana = styled.div`
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.muted};
`

// メタ情報：年齢＋性別・年齢層 ｜ 部署 ｜ 担当医（PatientCard と同じ流儀）
const PatientMeta = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${props => props.theme.spacing.md};
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
`

// ｜ 区切り（PatientCard と同じ独立要素）
const MetaDivider = styled.span`
    display: inline-block;
    width: 1px;
    height: 12px;
    background: ${props => props.theme.colors.border.default};
`

// 追加情報のグリッド（住所・電話・緊急連絡先 等）。sm 未満では 1 列に
const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${props => props.theme.spacing.md};

    @media (max-width: ${props => props.theme.breakpoints.sm}) {
        grid-template-columns: 1fr;
    }
`

const InfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
`

// 住所など横幅が必要な項目用（グリッド全幅）
const InfoItemFull = styled(InfoItem)`
    grid-column: 1 / -1;
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

// ------------------------------------------------------------
// タスクセクション
// ------------------------------------------------------------

const TaskSection = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    margin-top: ${props => props.theme.spacing.xl};
`

// 見出し+タブが 1 行に並ぶ（デザイン準拠）
const TaskHeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${props => props.theme.spacing.md};
    flex-wrap: wrap;
`

const SectionHeading = styled.h2`
    margin: 0;
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// タブ（AnnouncementTabs 相当のセグメント風）
const TabList = styled.div`
    display: inline-flex;
    gap: ${props => props.theme.spacing.xs};
    background: ${props => props.theme.colors.surface.sunken};
    padding: ${props => props.theme.spacing.xs};
    border-radius: ${props => props.theme.radius.md};
`

const Tab = styled.button<{ $active: boolean }>`
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    border: none;
    border-radius: ${props => props.theme.radius.sm};
    font-size: ${props => props.theme.fontSize.sm};
    font-family: inherit;
    cursor: pointer;

    background: ${props => props.$active ? props.theme.colors.surface.raised : 'transparent'};
    color: ${props => props.$active ? props.theme.colors.text.primary : props.theme.colors.text.secondary};
    font-weight: ${props => props.$active ? props.theme.fontWeight.bold : props.theme.fontWeight.normal};
`

// 並び替えコントロール（ラベル + 2つの Select 横並び）
const SortControls = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
`

// カテゴリ別グループの見出し（カテゴリ名）
const CategoryGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
    margin-bottom: ${props => props.theme.spacing.lg};
`

const CategoryHeading = styled.h3`
    margin: 0;
    font-size: ${props => props.theme.fontSize.md};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.secondary};
`

// 並び替え Select の選択肢
const SORT_BY_OPTIONS = [
    { value: 'createdAt', label: '発行日時' },
    { value: 'priority', label: '緊急度' },
]

const SORT_ORDER_OPTIONS = [
    { value: 'desc', label: '降順' },
    { value: 'asc', label: '昇順' },
]

const PatientDetailPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { currentUser } = useAuth()
    const theme = useTheme()
    const toast = useToast()

    const [tasks, setTasks] = useState<Task[] | null>(null)
    const [patient, setPatient] = useState<Patient | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [sortBy, setSortBy] = useState<'priority' | 'createdAt'>('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [taskSummary, setTaskSummary] = useState<TaskSummaryResponse | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    useEffect(() => {
        getPatientById(Number(id))
            .then(data => setPatient(data))
            .catch((error) => {
                toast.error(error.message)
                navigate('/patients')
            })

        getTasksByPatientId(Number(id))
            .then(data => setTasks(data))
            .catch((error) => {
                toast.error(error.message)
                navigate('/patients')
            })

        // サマリのキャッシュを取得
        getTaskSummary(Number(id))
            .then(data => setTaskSummary(data))
            .catch(() => {
                // エラーは無視（サマリ未生成は正常な状態）
            })
    }, [id])

    // タブに応じてタスクをフィルタリング
    const filteredTasks = useMemo(() => {
        if (!tasks) return []

        if (activeTab === 'my') {
            // 自分が担当のタスクのみ
            return tasks.filter(task =>
                task.assignees?.some(assignee => assignee.id === currentUser?.id)
            )
        }

        // all と category は同じタスクセット（表示方法だけ変える）
        return tasks
    }, [tasks, activeTab, currentUser])

    // カテゴリ別にグルーピング
    const tasksByCategory = useMemo(() => {
        const groups: { [key: string]: Task[] } = {}
        filteredTasks.forEach(task => {
            const categoryName = task.category?.categoryName || '未分類'
            if (!groups[categoryName]) groups[categoryName] = []
            groups[categoryName].push(task)
        })
        return groups
    }, [filteredTasks])

    // 優先度を数値に変換（並び替え用）
    const priorityValue = (priority: string) => {
        if (priority === 'HIGH') return 3
        if (priority === 'MEDIUM') return 2
        return 1  // LOW
    }

    // タスクを並び替える
    const sortTasks = (taskList: Task[]) => {
        return [...taskList].sort((a, b) => {
            let comparison = 0

            if (sortBy === 'priority') {
                comparison = priorityValue(b.priority) - priorityValue(a.priority)
            } else {
                // createdAt は文字列なので、Dateに変換して比較
                comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }

            // 昇順なら逆にする
            return sortOrder === 'asc' ? -comparison : comparison
        })
    }

    const handleGenerateSummary = async () => {
        setIsGenerating(true)
        try {
            const data = await generateTaskSummary(Number(id))
            setTaskSummary(data)
        } catch (error) {
            toast.error((error as Error).message)
        } finally {
            setIsGenerating(false)
        }
    }

    // 読み込み中は Loading（PatientCard と同じ patient 待ち。tasks もほぼ同時に届く前提）
    if (!patient) {
        return (
            <Column>
                <Loading />
            </Column>
        )
    }

    // 患者情報の整形
    const age = calcAge(patient.birth)
    const ageGroup = getAgeGroup(age)
    // 性別 → アイコン色ペア（PatientCard と同じ）
    const sexToColor = {
        MALE: theme.colors.patientIcon.male,
        FEMALE: theme.colors.patientIcon.female,
        UNKNOWN: theme.colors.patientIcon.unknown,
    }
    const iconColor = sexToColor[patient.sex]
    const doctorName = patient.doctor
        ? `${patient.doctor.lastName} ${patient.doctor.firstName}`
        : '-'
    const departmentName = patient.department?.departmentName ?? '-'
    // 緊急連絡先：人物名と電話番号を「（電話）」形式で
    const emergencyDisplay = patient.emergencyContactName
        ? `${patient.emergencyContactName}${patient.emergencyContactTel ? `（${patient.emergencyContactTel}）` : ''}`
        : '-'

    return (
        <Column>
            <BackLink to="/patients">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6"
                          stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                患者一覧へ戻る
            </BackLink>

            {/* ============ 患者基本情報カード ============ */}
            <DetailCard>
                <PatientRow>
                    <PatientIcon ageGroup={ageGroup} color={iconColor} />
                    <PatientContent>
                        <PatientKana>{patient.lastNameKana} {patient.firstNameKana}</PatientKana>
                        <PatientName>{patient.lastName} {patient.firstName}</PatientName>
                        <PatientMeta>
                            <span>{age}歳 {sexLabel[patient.sex]}・{ageGroupLabel[ageGroup]}</span>
                            <MetaDivider aria-hidden="true" />
                            <span>{departmentName}</span>
                            <MetaDivider aria-hidden="true" />
                            <span>担当医師 {doctorName}</span>
                        </PatientMeta>
                    </PatientContent>
                </PatientRow>

                {/* 追加情報：住所（全幅）/ 電話 / 緊急連絡先 */}
                <InfoGrid>
                    <InfoItem>
                        <InfoLabel>生年月日</InfoLabel>
                        <InfoValue>{patient.birth || '-'}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                        <InfoLabel>電話番号</InfoLabel>
                        <InfoValue>{patient.tel || '-'}</InfoValue>
                    </InfoItem>
                    <InfoItemFull>
                        <InfoLabel>住所</InfoLabel>
                        <InfoValue>{patient.address || '-'}</InfoValue>
                    </InfoItemFull>
                    <InfoItemFull>
                        <InfoLabel>緊急連絡先</InfoLabel>
                        <InfoValue>{emergencyDisplay}</InfoValue>
                    </InfoItemFull>
                </InfoGrid>
            </DetailCard>

            {/* ============ AI タスクサマリ ============ */}
            <AISummaryCard
                taskSummary={taskSummary}
                isGenerating={isGenerating}
                handleGenerateSummary={handleGenerateSummary}
            />

            {/* ============ タスクセクション ============ */}
            <TaskSection>
                <TaskHeaderRow>
                    <SectionHeading>タスク一覧</SectionHeading>
                    <TabList>
                        <Tab $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                            すべて
                        </Tab>
                        <Tab $active={activeTab === 'category'} onClick={() => setActiveTab('category')}>
                            カテゴリ別
                        </Tab>
                        <Tab $active={activeTab === 'my'} onClick={() => setActiveTab('my')}>
                            マイタスク
                        </Tab>
                    </TabList>
                </TaskHeaderRow>

                <SortControls>
                    <span>並び替え：</span>
                    <Select
                        options={SORT_BY_OPTIONS}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'priority' | 'createdAt')}
                    />
                    <Select
                        options={SORT_ORDER_OPTIONS}
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    />
                </SortControls>

                {tasks ? (
                    activeTab === 'category' ? (
                        // カテゴリ別表示：各カテゴリごとに1つの KanbanBoard を並べる
                        Object.entries(tasksByCategory).map(([categoryName, categoryTasks]) => (
                            <CategoryGroup key={categoryName}>
                                <CategoryHeading>{categoryName}</CategoryHeading>
                                <KanbanBoard tasks={sortTasks(categoryTasks)} />
                            </CategoryGroup>
                        ))
                    ) : (
                        // すべて / マイタスク 表示
                        <KanbanBoard tasks={sortTasks(filteredTasks)} />
                    )
                ) : (
                    // タスク取得中（患者取得済み・タスク未取得の間）
                    <Loading />
                )}
            </TaskSection>
        </Column>
    )
}

export default PatientDetailPage
