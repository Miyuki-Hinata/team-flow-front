import type { Priority, TaskStatus } from "../types/task"
import { TaskStatusSelect } from './ui/TaskStatusSelect'
import { PrioritySelect } from './ui/PrioritySelect'
import { FilterBar } from './ui/FilterBar'

type Props = {
    status: TaskStatus | null,
    priority: Priority | null,
    onStatusChange: (value: TaskStatus | null) => void,
    onPriorityChange: (value: Priority | null) => void
}

// タスク用のフィルタ。汎用 FilterBar に状態/優先度の 2 セレクトを載せる薄いラッパ。
// styled 定義は FilterBar 側に集約したので、ここは値の受け渡しに集中する
const TaskFilter = ({ status, priority, onStatusChange, onPriorityChange }: Props) => {
    return (
        <FilterBar>
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
        </FilterBar>
    )
}

export default TaskFilter
