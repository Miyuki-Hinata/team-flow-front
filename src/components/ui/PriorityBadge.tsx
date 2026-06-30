// src/components/ui/PriorityBadge.tsx
import { Badge } from './Badge'

// 優先度の値の型
type Priority = 'HIGH' | 'MEDIUM' | 'LOW'

// PriorityBadgeが受け取るprops
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

// 優先度の値 → 表示ラベルの対応表
const priorityToLabel = {
  HIGH: '優先度 高',
  MEDIUM: '優先度 中',
  LOW: '優先度 低',
} as const

// PriorityBadge本体
export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  // 渡された優先度から、色とラベルを対応表で引く
  return (
    <Badge tone={priorityToTone[priority]}>
      {priorityToLabel[priority]}
    </Badge>
  )
}