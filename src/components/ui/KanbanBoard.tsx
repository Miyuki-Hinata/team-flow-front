// components/ui/KanbanBoard.tsx
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'
import type { Task, TaskStatus } from '../../types/task'
import { statusLabel, formatDueDate } from '../../utils/task'
import { PriorityBadge } from './PriorityBadge'

// KanbanBoard が受け取る props。
// tasks のみを受ける単一責任設計：
// - グルーピング（ステータス別に列に分ける）は「カンバンとは何か」の定義そのものなので内部で持つ
// - 並び替え（priority / createdAt 等）はページ側の関心事なので、呼び出し側で並び替え済みの状態で渡す
type KanbanBoardProps = {
    tasks: Task[]   // 表示するタスク（並び替え済みで渡される）
}

// 列の順序（作業フロー順：未着手 → 進行中 → レビュー待ち → 完了）。
// 列見出しは utils/task.ts の statusLabel から日本語を引く。
const STATUS_ORDER: TaskStatus[] = ['CREATED', 'PROGRESS', 'REVIEWING', 'DONE']

// カンバン全体：常に 4 列を横並びにする。
// GitHub Projects のカンバンと同じく、狭い画面でも列を折り返さず、
// ボード内で横スクロールで確認できるようにする（overflow-x: auto）。
// これにより「列が縦積みされてタスクが読みづらくなる」問題を回避する。
const Board = styled.div`
    display: flex;
    gap: ${props => props.theme.spacing.md};
    overflow-x: auto;
    padding-bottom: ${props => props.theme.spacing.sm}; /* 横スクロールバー分の余白 */
`

// 1 列：沈んだ面（surface.sunken）を薄く敷いて「タスクを置く場所」と分かる見た目に。
// 幅を固定（280px）することで、TaskCard の横並びレイアウトが列内で崩れずに収まる。
// 280px はカンバン列の慣習的な幅（GitHub Projects と近い）。トークンにはない直値だが
// レイアウト定数として KanbanBoard 内に閉じる。
const Column = styled.div`
    flex: 0 0 280px;
    min-width: 280px;
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
    padding: ${props => props.theme.spacing.md};
    background: ${props => props.theme.colors.surface.sunken};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.md};
`

// 列見出し（日本語ラベル ＋ 件数）
const Heading = styled.div`
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.xs};
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
`

// 件数（見出しに続けて控えめに）
const Count = styled.span`
    font-size: ${props => props.theme.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
`

// 列内のカード縦積み（KanbanCard 同士の間隔）
const CardList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
`

// ------------------------------------------------------------
// KanbanCard（カンバン列内のタスクカード）
// ------------------------------------------------------------
// 一覧用の TaskCard は [状態バッジ][タイトル][優先度][期限] の横並び行レイアウトで、
// 280px のカンバン列内ではタイトルに割ける横幅が足りず日本語が縦積みになってしまう。
// カンバン用は「縦積み（優先度 → タイトル → 期限・担当）」のコンパクトカードとして
// KanbanBoard 内にローカル定義する。TaskCard 側は変更しない（一覧ページの表示を保つ）。
// デザインの TeamFlow.dc.html カンバン内タスクカードもこの順序。

// カード全体を包むリンク：<a> 既定の下線・紫を打ち消し
const KanbanCardLink = styled(Link)`
    display: block;
    text-decoration: none;
    color: inherit;
`

// 白カード：狭い列内で控えめな余白（一覧の Card より小さめ）
const KanbanCardBox = styled.div`
    background: ${props => props.theme.colors.surface.raised};
    border: 1px solid ${props => props.theme.colors.border.default};
    border-radius: ${props => props.theme.radius.md};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
    align-items: flex-start; /* 優先度バッジが横に伸びないよう左寄せ固定 */
`

// タイトル：本文サイズ・強調。長いタイトルは折り返す（word-break で日本語の単語区切りに強い折返し）
const KanbanCardTitle = styled.div`
    font-size: ${props => props.theme.fontSize.md};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
    word-break: break-word;
`

// メタ情報（期限 ・ 担当者）：控えめに補助文字色で表示
const KanbanCardMeta = styled.div`
    font-size: ${props => props.theme.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
    word-break: break-word;
`

// KanbanCard の props：
// - task: 表示対象のタスク
// - fromPath: 遷移元のパス（TaskDetailPage の戻るリンクで「元の画面に戻る」導線に使う）
type KanbanCardProps = {
    task: Task
    fromPath: string
}

// KanbanCard 本体:優先度 → タイトル → 期限・担当 の縦積み。
// 表示のみに責任を絞る(フィルタ・並び替えは KanbanBoard / ページ側の責任)。
// 遷移時は state.from に遷移元パスを載せる → TaskDetailPage 側で「〜へ戻る」を動的に切り替える。
const KanbanCard = ({ task, fromPath }: KanbanCardProps) => {
    // 期限は M/D H:mm 形式で整形（無ければ空文字）
    const dueDate = task.dueDate ? formatDueDate(task.dueDate) : ''
    // 担当者は姓を「、」で連結（TaskCard と同じ挙動）
    const assignee = task.assignees?.map(a => a.lastName).join('、') ?? ''
    // 「期限 ・ 担当」：存在する項目だけを「・」で連結
    const meta = [dueDate, assignee].filter(Boolean).join(' ・ ')

    return (
        <KanbanCardLink to={`/tasks/${task.id}`} state={{ from: fromPath }}>
            <KanbanCardBox>
                <PriorityBadge priority={task.priority} />
                <KanbanCardTitle>{task.title}</KanbanCardTitle>
                {meta && <KanbanCardMeta>{meta}</KanbanCardMeta>}
            </KanbanCardBox>
        </KanbanCardLink>
    )
}

// 列が空のときの控えめな表示。
// ui/EmptyState は padding: spacing.xxl(48px) と大きく、狭いカンバン列には過剰なため使わない。
// KanbanBoard 列内向けの小さめの空表示を内部に持つ（単一責任は保ちつつ、局所的な体裁調整）。
const EmptyLine = styled.p`
    margin: 0;
    padding: ${props => props.theme.spacing.md} 0;
    text-align: center;
    color: ${props => props.theme.colors.text.muted};
    font-size: ${props => props.theme.fontSize.xs};
`

// 渡された tasks をステータス別にグルーピングして返す。
// STATUS_ORDER の全キーを必ず持つオブジェクトを作ることで、
// 描画時に「その列にタスクが 1 件もない」ケースを空配列として自然に扱える。
const groupByStatus = (tasks: Task[]): Record<TaskStatus, Task[]> => {
    const groups: Record<TaskStatus, Task[]> = {
        CREATED: [],
        PROGRESS: [],
        REVIEWING: [],
        DONE: [],
    }
    tasks.forEach(task => {
        // 想定外の値でもクラッシュしないよう、キーの存在を確認してから push
        if (groups[task.taskStatus]) {
            groups[task.taskStatus].push(task)
        }
    })
    return groups
}

// KanbanBoard 本体。
// 単一責任：「渡されたタスクをステータス別の列に並べて表示する」だけを担う。
// D&D（ドラッグ&ドロップ）は実装しない：医療現場での誤操作リスクを避けるための意図的な選択。
// ステータス変更はタスク詳細ページのステータスクイック変更で行う想定。
export const KanbanBoard = ({ tasks }: KanbanBoardProps) => {
    const grouped = groupByStatus(tasks)
    // 現在のパスを取得し、カード遷移時に「遷移元」として state に載せる。
    // TaskDetailPage の戻るリンクで「〜へ戻る」の宛先を動的に切り替えるための情報。
    const { pathname } = useLocation()

    return (
        <Board>
            {STATUS_ORDER.map(status => {
                const columnTasks = grouped[status]
                return (
                    <Column key={status}>
                        <Heading>
                            {statusLabel[status]}
                            <Count>{columnTasks.length}</Count>
                        </Heading>

                        {columnTasks.length === 0 ? (
                            <EmptyLine>タスクなし</EmptyLine>
                        ) : (
                            <CardList>
                                {columnTasks.map(task => (
                                    <KanbanCard key={task.id} task={task} fromPath={pathname} />
                                ))}
                            </CardList>
                        )}
                    </Column>
                )
            })}
        </Board>
    )
}
