import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { announcements as fetchAnnouncements } from '../api/announcements'
import { getMyTasks } from '../api/tasks'
import type { Announcement } from '../types/announcement'
import type { Task } from '../types/task'
import type { Patient } from '../types/patient'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { PatientCard } from '../components/ui/PatientCard'
import { Loading } from '../components/ui/Loading'
import AnnouncementCard from '../components/AnnouncementCard'

// ------------------------------------------------------------
// レイアウト
// ------------------------------------------------------------

// サマリカード×3 のグリッド。md 未満（<768px）では 1 列に落として縦積みに（README §レスポンシブ挙動）
const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${props => props.theme.spacing.md};
    margin-bottom: ${props => props.theme.spacing.xl};

    @media (max-width: ${props => props.theme.breakpoints.md}) {
        grid-template-columns: 1fr;
    }
`

// 2 セクション（未読お知らせ / 本日の要対応患者）を横並びに。md 未満では 1 列に
const TwoColumn = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${props => props.theme.spacing.lg};

    @media (max-width: ${props => props.theme.breakpoints.md}) {
        grid-template-columns: 1fr;
    }
`

// セクションの縦積みコンテナ（見出し + 中身）
const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

// セクション見出し（未読お知らせ / 本日の要対応患者）：中サイズの太字
const SectionTitle = styled.h2`
    margin: 0;
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// カード一覧の縦積み（他一覧と同じ間隔で一体感を出す）
const CardList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
`

// ------------------------------------------------------------
// サマリカード（Dashboard 内でのみ使う軽量コンポーネント）
// ------------------------------------------------------------
// 白カード + ラベル小 + 大数字。クリックで該当画面へ遷移する
// →お手本の PatientCard と同じく「表示のみ」に責任を絞り、遷移は Link に委譲する

// Link で全体を包み、下線・文字色（紫）を打ち消す（他カードと同方針）
const SummaryLink = styled(Link)`
    display: block;
    text-decoration: none;
    color: inherit;
`

const SummaryCardBox = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.lg};
    padding: ${props => props.theme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    &:hover {
        border-color: ${props => props.theme.colors.border.strong};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
`

// ラベル（例：「担当患者」）：控えめな小さい文字
const SummaryLabel = styled.div`
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
`

// 大数字：デザインの 28px/500 相当。theme の xxl（28px）で対応
const SummaryValue = styled.div`
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// 単位（例：「名」「件」）：値の後ろに小さめで添える
const SummaryUnit = styled.span`
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.colors.text.secondary};
    margin-left: ${props => props.theme.spacing.xs};
`

type SummaryCardProps = {
    label: string
    value: number
    unit: string
    to: string
}

// お手本 PatientCard に倣い、props は分割代入で受け取り、表示のみ・遷移は外に委譲
const SummaryCard = ({ label, value, unit, to }: SummaryCardProps) => (
    <SummaryLink to={to}>
        <SummaryCardBox>
            <SummaryLabel>{label}</SummaryLabel>
            <SummaryValue>
                {value}<SummaryUnit>{unit}</SummaryUnit>
            </SummaryValue>
        </SummaryCardBox>
    </SummaryLink>
)

// ------------------------------------------------------------
// タイトル用ユーティリティ
// ------------------------------------------------------------

// 今日の日付を「M月D日 (曜)」形式に。ヘッダーの formatToday と別書式（サブタイトル用にやや丁寧に）
const formatSubtitle = (): string => {
    const now = new Date()
    const dow = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()]
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 (${dow})`
}

// 期限日が今日の 0:00〜23:59 に入っているか（時刻無視の日単位比較）
const isDueToday = (isoString: string | null | undefined): boolean => {
    if (!isoString) return false
    const d = new Date(isoString)
    const now = new Date()
    return d.getFullYear() === now.getFullYear()
        && d.getMonth() === now.getMonth()
        && d.getDate() === now.getDate()
}

// タスクの期限が今日以前（＝今日 or 期限切れ）で、かつ未完了かどうか。要対応患者の抽出条件
const isTodayOrOverdue = (task: Task): boolean => {
    if (task.taskStatus === 'DONE') return false
    if (!task.dueDate) return false
    const due = new Date(task.dueDate).getTime()
    // 今日の 23:59:59 まで含める
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    return due <= endOfToday.getTime()
}

// ------------------------------------------------------------
// 画面本体
// ------------------------------------------------------------

function DashboardPage() {
    const { currentUser } = useAuth()
    const [announcements, setAnnouncements] = useState<Announcement[] | null>(null)
    const [myTasks, setMyTasks] = useState<Task[] | null>(null)

    // 初回に必要データを並列取得（ダッシュボードは複数リソースの集約画面）
    useEffect(() => {
        fetchAnnouncements().then(setAnnouncements)
        getMyTasks().then(setMyTasks)
    }, [])

    // 未読お知らせ（表示は最大3件）
    const unread = useMemo(
        () => (announcements ?? []).filter(a => !a.isRead),
        [announcements]
    )
    const unreadTop3 = unread.slice(0, 3)

    // 担当患者：自分に割り当てられたタスクから患者をユニーク抽出
    const myPatients = useMemo<Patient[]>(() => {
        if (!myTasks) return []
        const seen = new Map<number, Patient>()
        myTasks.forEach(t => {
            if (t.patient && !seen.has(t.patient.id)) {
                seen.set(t.patient.id, t.patient as Patient)
            }
        })
        return Array.from(seen.values())
    }, [myTasks])

    // 本日のタスク数：自分のタスクのうち、期限が今日のもの
    const todayTaskCount = useMemo(
        () => (myTasks ?? []).filter(t => isDueToday(t.dueDate)).length,
        [myTasks]
    )

    // 本日の要対応患者：期限が今日以前で未完了のタスクを持つ患者（ユニーク）
    const urgentPatients = useMemo<Patient[]>(() => {
        if (!myTasks) return []
        const seen = new Map<number, Patient>()
        myTasks.filter(isTodayOrOverdue).forEach(t => {
            if (t.patient && !seen.has(t.patient.id)) {
                seen.set(t.patient.id, t.patient as Patient)
            }
        })
        return Array.from(seen.values())
    }, [myTasks])

    // 全ての取得が終わるまでは Loading。並列取得なので個別ではなくまとめて判定
    if (announcements === null || myTasks === null) {
        return <Loading />
    }

    // 名前は「ユーザー名」の姓を使う。currentUser が null の可能性は PrivateRoute で担保済みだが念のためフォールバック
    const greetingName = currentUser?.lastName ?? 'ゲスト'

    // AnnouncementCard は onRead を必須で受け取るが、Dashboard は既読化しない仕様（既存維持）。
    // 挙動を変えないため noop（何もしない関数）を渡す。詳細ページ側で既読化される想定。
    const noopRead = () => {}

    return (
        <div>
            <PageHeader
                title={`おはようございます、${greetingName}さん`}
                subtitle={formatSubtitle()}
            />

            {/* サマリカード×3：担当患者 / 本日のタスク / 未読お知らせ。それぞれ関連ページへ遷移 */}
            <SummaryGrid>
                {/* 担当患者は「マイタスク（患者別グルーピング）」に着地。専用の担当患者一覧は作らず、マイタスク側で兼ねる */}
                <SummaryCard label="担当患者" value={myPatients.length} unit="名" to="/tasks/my-tasks" />
                <SummaryCard label="本日のタスク" value={todayTaskCount} unit="件" to="/tasks/my-tasks" />
                <SummaryCard label="未読お知らせ" value={unread.length} unit="件" to="/announcements" />
            </SummaryGrid>

            {/* 2列：未読お知らせ / 本日の要対応患者 */}
            <TwoColumn>
                <Section>
                    <SectionTitle>未読お知らせ</SectionTitle>
                    {unread.length === 0 ? (
                        <EmptyState message="新規お知らせはありません" />
                    ) : (
                        <CardList>
                            {unreadTop3.map(announcement => (
                                <AnnouncementCard
                                    key={announcement.id}
                                    announcement={announcement}
                                    onRead={noopRead}
                                />
                            ))}
                        </CardList>
                    )}
                </Section>

                <Section>
                    <SectionTitle>本日の要対応患者</SectionTitle>
                    {urgentPatients.length === 0 ? (
                        <EmptyState message="本日対応が必要な患者はいません" />
                    ) : (
                        <CardList>
                            {urgentPatients.map(patient => (
                                // PatientCard 自身は表示のみ。詳細ページへの遷移は Link に委譲（一覧ページと同じ方針）
                                <Link key={patient.id} to={`/patients/${patient.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <PatientCard patient={patient} />
                                </Link>
                            ))}
                        </CardList>
                    )}
                </Section>
            </TwoColumn>
        </div>
    )
}

export default DashboardPage
