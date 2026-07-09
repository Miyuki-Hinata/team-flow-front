import type { Priority, TaskStatus } from "../types/task"
import styled from 'styled-components'
import { TaskStatusSelect } from './ui/TaskStatusSelect'
import { PrioritySelect } from './ui/PrioritySelect'

type Props = {
    status: TaskStatus | null,
    priority: Priority | null,
    onStatusChange: (value: TaskStatus | null) => void,
    onPriorityChange: (value: Priority | null) => void
}

// フィルタの各セレクトを横並びにする器。間隔はトークンで揃える。
// ※汎用 FilterBar は別フェーズ。ここでは既存構造のまま素の <select> を土台 Select に置換するのみ。
const Filters = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${props => props.theme.spacing.sm};
`

const TaskFilter = ({ status, priority, onStatusChange, onPriorityChange }: Props) => {
    return (
        <Filters>
            {/* ステータス絞り込み：placeholder="すべて" で空値(=絞り込み解除)の選択肢を先頭に出す。
                '' ⇔ null のマッピングは従来どおり維持する。 */}
            <TaskStatusSelect
                placeholder="状態：すべて"
                value={status ?? ''}
                onChange={(e) => onStatusChange(e.target.value === '' ? null : e.target.value as TaskStatus)}
            />

            {/* 優先度絞り込み：同上 */}
            <PrioritySelect
                placeholder="優先度：すべて"
                value={priority ?? ''}
                onChange={(e) => onPriorityChange(e.target.value === '' ? null : e.target.value as Priority)}
            />
        </Filters>
    )
}

export default TaskFilter
