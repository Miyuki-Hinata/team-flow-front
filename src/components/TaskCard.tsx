import type { Task } from "../types/task"
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Card } from './ui/Card'
import { StatusBadge } from './ui/StatusBadge'
import { PriorityBadge } from './ui/PriorityBadge'
import { formatDueDate } from '../utils/task'

type Props = {
    task: Task
}

// カード全体を包むリンク。<a> 既定の下線・文字色（紫）を打ち消す（お知らせ系と同じ方針）。
const CardLink = styled(Link)`
    display: block;
    text-decoration: none;
    color: inherit;
`

// 行レイアウト：デザインどおり横並び・上下中央揃え。左から 状態バッジ / 本文 / 優先度 / 期限・担当。
const Row = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.md};
`

// 状態バッジ列：min-width で列幅を固定し、複数カードで縦のバッジ位置が揃うようにする（README §8）。
// トークンに無い px 値だが README で明示されたレイアウト定数なので直書きで採用する
const StatusColumn = styled.div`
    min-width: 64px;
    display: flex;
    justify-content: flex-start;
`

// 本文ブロック（タイトル＋サブメタ）。残り幅を占め、はみ出しを防ぐため min-width:0 を付ける。
const Main = styled.div`
    flex: 1 1 auto;
    min-width: 0;
`

// タイトル：小見出しサイズ・強調・主要文字色
const Title = styled.div`
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// サブメタ（患者 ・ カテゴリ）：補助的な文字色・ラベルサイズで控えめに
const SubMeta = styled.div`
    margin-top: ${props => props.theme.spacing.xs};
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.secondary};
`

// 期限・担当ブロック：右寄せ。ラベル（小さく薄く）＋値の2段。
// min-width で列幅を固定し、複数カードで期限・担当ブロックの左端が揃うようにする（README §8）
const DueAssignee = styled.div`
    text-align: right;
    min-width: 150px;
`

const DueLabel = styled.div`
    font-size: ${props => props.theme.fontSize.xs};
    color: ${props => props.theme.colors.text.muted};
`

const DueValue = styled.div`
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.text.primary};
`

const TaskCard = ({ task }: Props) => {
    // 患者名：既存挙動を維持するため姓名連結は + '' + のまま（空文字連結＝姓名が詰まる。別Issue申し送り）
    // 姓と名の間は半角スペース区切り（他のページ・カードと表記統一。以前は空文字連結で「山田太郎」と詰まっていた）
    const patientName = task.patient ? task.patient.lastName + ' ' + task.patient.firstName : null

    // 「患者 ・ カテゴリ」：存在する項目だけを「・」で連結（欠けても崩れないように）
    const subMeta = [patientName, task.category?.categoryName].filter(Boolean).join(' ・ ')

    // 担当者（複数可）は姓を「、」で連結
    const assigneeText = task.assignees?.map(assignee => assignee.lastName).join('、')

    // 「期限 ・ 担当」の値：存在する項目だけを「・」で連結
    // 「期限 ・ 担当」の値：期限は ISO 文字列を "M/D H:mm" に整形。存在する項目だけを「・」で連結
    const dueAssignee = [formatDueDate(task.dueDate), assigneeText].filter(Boolean).join(' ・ ')

    return (
        // クリックで詳細へ遷移。挙動は従来どおり維持する
        <CardLink to={`/tasks/${task.id}`}>
            <Card>
                <Row>
                    {/* 左：ステータスバッジ（幅を固定して縦揃えを実現） */}
                    <StatusColumn>
                        <StatusBadge status={task.taskStatus} />
                    </StatusColumn>

                    {/* 中央：タイトル＋（患者 ・ カテゴリ）。残り幅を占める */}
                    <Main>
                        <Title>{task.title}</Title>
                        {subMeta && <SubMeta>{subMeta}</SubMeta>}
                    </Main>

                    {/* 優先度バッジ */}
                    <PriorityBadge priority={task.priority} />

                    {/* 右：期限 ・ 担当（内容がある時だけラベルごと表示） */}
                    {dueAssignee && (
                        <DueAssignee>
                            <DueLabel>期限 ・ 担当</DueLabel>
                            <DueValue>{dueAssignee}</DueValue>
                        </DueAssignee>
                    )}
                </Row>
            </Card>
        </CardLink>
    )
}

export default TaskCard
