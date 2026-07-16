// src/components/ui/PriorityBadge.tsx
import { Badge } from './Badge'
import type { Priority } from '../../types/task'

type PriorityBadgeProps = {
    priority: Priority
}

// 優先度の値 → tone(色) の対応表
// ここで「優先度の意味」と「色の意味」を結びつける
const priorityToTone = {
    HIGH: 'danger',    // 高 → 赤
    MEDIUM: 'warning', // 中 → 黄
    LOW: 'success',    // 低 → 緑
} as const

// 優先度の値 → 表示ラベル。
// ※これは PriorityBadge 固有の詳細ラベル（"優先度 高" 等）で、
// utils/task.ts の priorityLabel（"高/中/低"）とは意図的に別文言。
// - バッジ：単体で表示されるため「優先度 高」と文脈を含めて意味を伝える必要がある
// - セレクト：フォームで「優先度」ラベルの隣に並ぶため「高/中/低」で冗長さを避ける
// 集約するとどちらかが不便になるため、共通化せず個別に持たせている。
const priorityToLabel = {
    HIGH: '優先度 高',
    MEDIUM: '優先度 中',
    LOW: '優先度 低',
} as const

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
    return (
        <Badge tone={priorityToTone[priority]}>
            {priorityToLabel[priority]}
        </Badge>
    )
}
