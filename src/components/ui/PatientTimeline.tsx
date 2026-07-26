import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import type { Task, Priority } from '../../types/task'
import { EmptyState } from './EmptyState'

// 受け持ち患者のタスクを時系列で見せる表示専用コンポーネント（レール型タイムライン）。
// 同じ縦レール上に2種類の目盛りを時刻順で混在させる：
//   ・タスクが無い時間 … 1時間おきの薄いグレー目盛り（HH:00）。空き時間がひと目で分かる
//   ・タスクがある時刻 … その実時刻（HH:mm）＋優先度色のドット＋タスクカード（モック準拠）
// 午前 / 午後 / 夜 で区切って“1日の流れ”を出す。正確な時刻はカードにも表示。
// 期限超過は時間軸に載せず上部に独立（赤で強調）。
//
// 責任は「渡されたタスクを今日視点で並べて見せる」＋「クリックで詳細へ渡す」まで。
// 取得や受け持ち患者の絞り込みは呼び出し側の責任（PatientCard と同じ分担）。
type PatientTimelineProps = {
    tasks: Task[]
    // 表示する日付（その日の 0:00〜23:59 のタスクを並べる）。呼び出し側が切り替える。
    date: Date
}

// 時間帯の区切り定義（午前 0-11 / 午後 12-17 / 夜 18-23）
const PERIODS: { label: string; startHour: number; endHour: number }[] = [
    { label: '午前', startHour: 0, endHour: 11 },
    { label: '午後', startHour: 12, endHour: 17 },
    { label: '夜', startHour: 18, endHour: 23 },
]

// 優先度 → ドット色。PriorityBadge の tone 対応（高=赤 / 中=黄 / 低=緑）と意味を揃える（1色1意味・メリハリ）。
const priorityColor = (priority: Priority, theme: import('../../styles/theme').Theme) => {
    if (priority === 'HIGH') return theme.colors.semantic.danger.main
    if (priority === 'MEDIUM') return theme.colors.semantic.warning.main
    return theme.colors.semantic.success.main
}

// 優先度の強さ（同時刻のドット色は「最も緊急なもの」で塗るため）
const priorityRank: Record<Priority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 }
const highestPriority = (tasks: Task[]): Priority =>
    tasks.reduce<Priority>((top, t) => (priorityRank[t.priority] > priorityRank[top] ? t.priority : top), 'LOW')

// 時刻を HH:mm に整形
const formatTime = (iso: string): string => {
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 期限超過の表示用：M/D HH:mm（前日以前もあるため日付を含める）
const formatOverdueWhen = (iso: string): string => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${formatTime(iso)}`
}

// 患者名を整形（null 安全）。氏名テストと同じ「姓 名」の半角スペース区切り
const patientName = (task: Task): string =>
    task.patient ? `${task.patient.lastName} ${task.patient.firstName}` : '—'

// レール上の1目盛り。空き時間の目盛り(tick) か、タスクのある時刻(group) のどちらか。
// minutes（0:00からの分）で時刻順に並べ替え、hour で午前/午後/夜に振り分ける。
type RailEntry =
    | { kind: 'tick'; minutes: number; hour: number; label: string }
    | { kind: 'group'; minutes: number; hour: number; label: string; tasks: Task[]; dotPriority: Priority }

// ------------------------------------------------------------
// styled
// ------------------------------------------------------------

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
`

const OverdueBox = styled.section`
    background: ${props => props.theme.colors.semantic.danger.bg};
    border: 1px solid ${props => props.theme.colors.semantic.danger.main};
    border-left-width: 4px;
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.md};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
`

const OverdueTitle = styled.h3`
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.xs};
    font-size: ${props => props.theme.fontSize.md};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.semantic.danger.main};
`

const OverdueRow = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.primary};
    cursor: pointer;
    border-radius: ${props => props.theme.radius.md};
    &:hover { background: ${props => props.theme.colors.surface.raised}; }
`

const OverdueWhen = styled.span`
    flex: 0 0 auto;
    min-width: 84px;
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.semantic.danger.main};
`

const OverdueTaskTitle = styled.span`
    flex: 1 1 auto;
    min-width: 0;
`

// 患者名ピル：カード/行の「タスク詳細」とは別に患者詳細へ飛ばす小リンク。下線ではなくピルで示す。
const PatientPill = styled.span`
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: ${props => props.theme.spacing.xs};
    font-size: ${props => props.theme.fontSize.xs};
    padding: 2px ${props => props.theme.spacing.sm};
    border-radius: ${props => props.theme.radius.full};
    background: ${props => props.theme.colors.surface.sunken};
    border: 1px solid ${props => props.theme.colors.border.default};
    color: ${props => props.theme.colors.brand.teal};
    cursor: pointer;
    white-space: nowrap;
    &:hover {
        border-color: ${props => props.theme.colors.brand.teal};
        color: ${props => props.theme.colors.brand.tealDark};
    }
`

const TimelineArea = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
`

const TimelineTitle = styled.h3`
    margin: 0;
    font-size: ${props => props.theme.fontSize.md};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

const PeriodBlockEl = styled.section`
    display: flex;
    flex-direction: column;
    & + & { margin-top: ${props => props.theme.spacing.md}; }
`

const PeriodHeading = styled.div`
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.secondary};
    margin-bottom: ${props => props.theme.spacing.xs};
`

// 目盛り行を隙間なく積む（縦レールを連続させるため gap: 0）
const RailList = styled.div`
    display: flex;
    flex-direction: column;
`

// 1目盛りの行：[時刻][レール＋ドット][カード群]
const Row = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.sm};
    min-height: 28px;
`

// 時刻ラベル。タスクのある時刻＝secondary、空き時間の目盛り＝薄いグレー(muted)
const TimeLabel = styled.div<{ $active: boolean }>`
    flex: 0 0 46px;
    width: 46px;
    text-align: right;
    padding-top: 2px;
    font-size: ${props => props.theme.fontSize.xs};
    color: ${props => (props.$active ? props.theme.colors.text.secondary : props.theme.colors.text.muted)};
`

// レール列：縦線＋（タスクのある時刻だけ）ドット
const RailCol = styled.div`
    position: relative;
    flex: 0 0 14px;
    width: 14px;
`

const RailLine = styled.span`
    position: absolute;
    left: 6px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${props => props.theme.colors.border.default};
`

const Dot = styled.span<{ $priority: Priority }>`
    position: absolute;
    left: 0;
    top: 5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.theme.colors.surface.raised};
    border: 2px solid ${props => priorityColor(props.$priority, props.theme)};
`

// カード群（同時刻のタスクを縦積み）
const CardCol = styled.div`
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
    padding-bottom: ${props => props.theme.spacing.sm};
`

const TaskCardEl = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
    cursor: pointer;
    &:hover { border-color: ${props => props.theme.colors.border.strong}; }
`

const CardTitle = styled.div`
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const CardMeta = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    flex-wrap: wrap;
`

// カード内の正確な時刻（目盛りが1時間刻みの箇所でも、分までの時刻をここで担保）
const CardTime = styled.span`
    flex: 0 0 auto;
    font-size: ${props => props.theme.fontSize.xs};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.secondary};
`

// 同時刻に複数タスクがある場合の囲み。沈んだ面(sunken)を背景にして、
// 中の白いカード(raised)が浮いて見えることで「これらは同時刻のまとまり」と伝える。
const GroupBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
    padding: ${props => props.theme.spacing.sm};
    background: ${props => props.theme.colors.surface.sunken};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
`

// 囲みの見出し：「同時刻 N件」を控えめに添える
const GroupCaption = styled.div`
    font-size: ${props => props.theme.fontSize.xs};
    color: ${props => props.theme.colors.text.muted};
`

const UserMiniIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5.5 19c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
)

export const PatientTimeline = ({ tasks, date }: PatientTimelineProps) => {
    const navigate = useNavigate()

    // 表示対象日の 0:00〜23:59
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // 選択日が「今日」か（期限超過セクションは今日を見ているときだけ出す）
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const isToday = startOfDay.getTime() === todayStart.getTime()

    // 期限超過：今日より前で未完了のタスク（DONE 除外）。※今日を表示中のときだけ意味を持つ
    const overdue = isToday
        ? tasks
            .filter(t => t.dueDate && new Date(t.dueDate) < todayStart && t.taskStatus !== 'DONE')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        : []

    // 表示対象日：期限がその日の 0:00〜23:59 に入るタスク
    const dayTasks = tasks.filter(t => {
        if (!t.dueDate) return false
        const due = new Date(t.dueDate)
        return due >= startOfDay && due <= endOfDay
    })

    if (overdue.length === 0 && dayTasks.length === 0) {
        return <EmptyState message={isToday ? '本日のタスクはありません' : 'この日のタスクはありません'} />
    }

    // タスクを「同時刻(HH:mm)」ごとにまとめる
    const byTime = new Map<string, Task[]>()
    dayTasks.forEach(t => {
        const key = formatTime(t.dueDate)
        if (!byTime.has(key)) byTime.set(key, [])
        byTime.get(key)!.push(t)
    })
    // タスクが存在する「時」の集合（この時間には空き目盛りを出さない）
    const hoursWithTasks = new Set(dayTasks.map(t => new Date(t.dueDate).getHours()))

    // レール上の目盛りを組み立てる：
    //   ・タスクが無い各時（HH）→ 空き目盛り(tick)
    //   ・タスクのある各時刻(HH:mm) → タスク目盛り(group)
    const entries: RailEntry[] = []
    for (let h = 0; h < 24; h++) {
        if (!hoursWithTasks.has(h)) {
            entries.push({ kind: 'tick', minutes: h * 60, hour: h, label: `${String(h).padStart(2, '0')}:00` })
        }
    }
    byTime.forEach((groupTasks, label) => {
        const d = new Date(groupTasks[0].dueDate)
        entries.push({
            kind: 'group',
            minutes: d.getHours() * 60 + d.getMinutes(),
            hour: d.getHours(),
            label,
            tasks: groupTasks,
            dotPriority: highestPriority(groupTasks),
        })
    })
    // 時刻順（分）に並べ替え、同分なら tick を先に（境界の見た目安定）
    entries.sort((a, b) => a.minutes - b.minutes || (a.kind === 'tick' ? -1 : 1))

    // 遷移ハンドラ
    const goTask = (taskId: number) => navigate(`/tasks/${taskId}`)
    const goPatient = (patientId: number) => navigate(`/patients/${patientId}`)

    // キーボード操作（Enter / Space）で onClick 相当を発火（role="link" の a11y 補助）
    const keyActivate = (fn: () => void) => (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fn()
        }
    }

    // 患者名ピル（クリックで患者詳細・親のタスク遷移は止める）。patient が無ければ非リンク表示
    const renderPatient = (task: Task) => {
        const patient = task.patient
        if (!patient) {
            return <PatientPill as="span"><UserMiniIcon />{patientName(task)}</PatientPill>
        }
        return (
            <PatientPill
                role="link"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); goPatient(patient.id) }}
                onKeyDown={(e) => { e.stopPropagation(); keyActivate(() => goPatient(patient.id))(e) }}
            >
                <UserMiniIcon />{patientName(task)}
            </PatientPill>
        )
    }

    // タスクカード1枚（全体がタスク詳細への導線）
    const renderCard = (task: Task) => (
        <TaskCardEl
            key={task.id}
            role="link"
            tabIndex={0}
            onClick={() => goTask(task.id)}
            onKeyDown={keyActivate(() => goTask(task.id))}
        >
            <CardTitle>{task.title}</CardTitle>
            <CardMeta>
                <CardTime>{formatTime(task.dueDate)}</CardTime>
                {renderPatient(task)}
            </CardMeta>
        </TaskCardEl>
    )

    // 1目盛り（tick / group）を1行として描画
    const renderEntry = (entry: RailEntry) => (
        <Row key={`${entry.kind}-${entry.minutes}-${entry.label}`}>
            <TimeLabel $active={entry.kind === 'group'}>{entry.label}</TimeLabel>
            <RailCol>
                <RailLine />
                {entry.kind === 'group' && <Dot $priority={entry.dotPriority} />}
            </RailCol>
            <CardCol>
                {entry.kind === 'group' &&
                    // 同時刻が2件以上のときだけ囲んで「同時刻のまとまり」と分かるようにする。
                    // 1件のときは囲まず素のカードにして、無駄な入れ子・視覚ノイズを避ける
                    (entry.tasks.length > 1 ? (
                        <GroupBox>
                            <GroupCaption>同時刻 {entry.tasks.length}件</GroupCaption>
                            {entry.tasks.map(renderCard)}
                        </GroupBox>
                    ) : (
                        entry.tasks.map(renderCard)
                    ))}
            </CardCol>
        </Row>
    )

    return (
        <Wrapper>
            {/* 期限超過：時間軸に載せず最上部に独立表示（見落とし防止＋メリハリ） */}
            {overdue.length > 0 && (
                <OverdueBox>
                    <OverdueTitle>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 9v4M12 17h.01M10.3 4.3 2.6 18a1.5 1.5 0 0 0 1.3 2.3h16.2A1.5 1.5 0 0 0 21.4 18L13.7 4.3a1.5 1.5 0 0 0-2.6 0Z"
                                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        期限超過 {overdue.length} 件
                    </OverdueTitle>
                    {overdue.map(task => (
                        <OverdueRow
                            key={task.id}
                            role="link"
                            tabIndex={0}
                            onClick={() => goTask(task.id)}
                            onKeyDown={keyActivate(() => goTask(task.id))}
                        >
                            <OverdueWhen>{formatOverdueWhen(task.dueDate)}</OverdueWhen>
                            <OverdueTaskTitle>{task.title}</OverdueTaskTitle>
                            {renderPatient(task)}
                        </OverdueRow>
                    ))}
                </OverdueBox>
            )}

            {/* 本日のタイムライン（空き＝1時間おきの薄い目盛り／タスク＝実時刻＋ドット） */}
            <TimelineArea>
                <TimelineTitle>タイムライン</TimelineTitle>
                {PERIODS.map(period => {
                    const periodEntries = entries.filter(e => e.hour >= period.startHour && e.hour <= period.endHour)
                    if (periodEntries.length === 0) return null
                    return (
                        <PeriodBlockEl key={period.label}>
                            <PeriodHeading>{period.label}</PeriodHeading>
                            <RailList>{periodEntries.map(renderEntry)}</RailList>
                        </PeriodBlockEl>
                    )
                })}
            </TimelineArea>
        </Wrapper>
    )
}
