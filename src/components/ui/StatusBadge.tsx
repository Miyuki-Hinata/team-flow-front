import { Badge } from "./Badge"
import type { TaskStatus } from "../../types/task"
import { statusLabel } from "../../utils/task"

type StatusBadgeProps = {
    status: TaskStatus
}

// ステータス値 → tone（色）の対応表。
// StatusBadge 固有の視覚表現なのでここに置く（ラベルは utils/task.ts で共通化）。
const statusToTone = {
    CREATED: 'neutral',
    PROGRESS: 'info',
    REVIEWING: 'warning',
    DONE: 'success'
} as const

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    return (
        <Badge tone={statusToTone[status]}>
            {statusLabel[status]}
        </Badge>
    )
}
