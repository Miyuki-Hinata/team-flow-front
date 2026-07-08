// components/ui/TaskStatusSelect.tsx
import { Select } from './Select'
import type { TaskStatus } from '../../types/task'

// TaskStatusSelect が受け取る props。
// 標準の <select> 属性は継承しつつ、options は内部で固定するので受け取らない。
// placeholder だけ任意で足す（<select> は placeholder 属性を持たないため）。
type TaskStatusSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    placeholder?: string
}

// ステータスの値 → 表示ラベルの対応表。
// 表示コンポーネント StatusBadge と同じ日本語ラベルで揃える（アプリ全体で表記を統一）。
const statusToLabel: Record<TaskStatus, string> = {
    CREATED: '未着手',
    PROGRESS: '進行中',
    REVIEWING: 'レビュー待ち',
    DONE: '完了',
}

// 選択肢データ。作業の流れの順（未着手→進行中→レビュー待ち→完了）に並べる。
// 型（TaskStatus）を配列の元にすることで、値の追加漏れ・タイプミスを型で防ぐ。
const statusOptions = (['CREATED', 'PROGRESS', 'REVIEWING', 'DONE'] as TaskStatus[]).map(value => ({
    value,
    label: statusToLabel[value],
}))

// TaskStatusSelect 本体。
// ステータス固有の options を固定し、残りの標準属性・placeholder は汎用 Select にそのまま渡す。
// 見た目・属性転送は Select の責任。ここは「ステータスという意味づけ」だけを担う（単一責任）。
export const TaskStatusSelect = ({ ...rest }: TaskStatusSelectProps) => {
    return <Select options={statusOptions} {...rest} />
}
