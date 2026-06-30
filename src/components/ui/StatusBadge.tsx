import { Badge } from "./Badge"

type Status = 'CREATED' | 'PROGRESS' | 'REVIEWING' |'DONE'

type StatusBadgeProps = {
    status: Status
}

const statusToTone = {
    CREATED: 'neutral',
    PROGRESS: 'info',
    REVIEWING: 'warning',
    DONE: 'success'
} as const


const statusToLabel = {
    CREATED: '未着手',
    PROGRESS: '進行中',
    REVIEWING: 'レビュー待ち',
    DONE: '完了'
} as const


export const StatusBadge = ({ status }: StatusBadgeProps) => {
    return (
        <Badge tone={statusToTone[status]}>
            {statusToLabel[status]}
        </Badge>
    )
}
