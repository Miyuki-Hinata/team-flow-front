// components/ui/TaskStatusSelect.tsx
import { Select } from './Select'
import { TASK_STATUS_OPTIONS } from '../../utils/task'

// TaskStatusSelect が受け取る props。
// 標準の <select> 属性は継承しつつ、options は内部で固定するので受け取らない。
// placeholder だけ任意で足す（<select> は placeholder 属性を持たないため）。
type TaskStatusSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    placeholder?: string
}

// TaskStatusSelect 本体。
// ステータス固有の options（utils/task.ts で一元管理）を固定し、
// 残りの標準属性・placeholder は汎用 Select にそのまま渡す。
// 見た目・属性転送は Select の責任。ここは「ステータスという意味づけ」だけを担う（単一責任）。
export const TaskStatusSelect = ({ ...rest }: TaskStatusSelectProps) => {
    return <Select options={TASK_STATUS_OPTIONS} {...rest} />
}
