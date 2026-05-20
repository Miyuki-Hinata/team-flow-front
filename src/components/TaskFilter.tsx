import type { Priority, TaskStatus } from "../types/task"

type Props = {
    status: TaskStatus | null,
    priority: Priority | null,
    onStatusChange: (value: TaskStatus | null) => void,
    onPriorityChange: (value: Priority | null) =>  void
}

const TaskFilter = ({ status, priority, onStatusChange, onPriorityChange }: Props) => {
    return (
        <div>
            <select
                value={status ?? ''}
                onChange={(e) => onStatusChange(e.target.value === '' ? null : e.target.value as TaskStatus)}
            >
                <option value="">すべて</option>
                <option value="CREATED">未着手</option>
                <option value="PROGRESS">進行中</option>
                <option value="REVIEWING">レビュー中</option>
                <option value="DONE">完了</option>
            </select>
            <select
                value={priority ?? ''}
                onChange={(e) => onPriorityChange(e.target.value === '' ? null : e.target.value as Priority)}
            >
                <option value="">すべて</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
            </select>
        </div>
    )
}

export default TaskFilter