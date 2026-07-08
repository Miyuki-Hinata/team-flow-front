// components/ui/PrioritySelect.tsx
import { Select } from './Select'
import type { Priority } from '../../types/task'

// PrioritySelect が受け取る props。
// 標準の <select> 属性（value / onChange / disabled など）は継承しつつ、
// options は内部で固定するので受け取らない。placeholder だけ任意で足す
// （<select> 自体は placeholder 属性を持たないため独自に追加する）。
type PrioritySelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    placeholder?: string
}

// 優先度の値 → 表示ラベルの対応表。
// フォーム内では「優先度」ラベルの隣に並ぶ想定なので、簡潔な1文字で示す。
const priorityToLabel: Record<Priority, string> = {
    HIGH: '高',
    MEDIUM: '中',
    LOW: '低',
}

// 選択肢データ。重い順（高→低）に並べ、優先度の高さが直感的に伝わるようにする。
// 型（Priority）を配列の元にすることで、値の追加漏れ・タイプミスを型で防ぐ。
const priorityOptions = (['HIGH', 'MEDIUM', 'LOW'] as Priority[]).map(value => ({
    value,
    label: priorityToLabel[value],
}))

// PrioritySelect 本体。
// 優先度固有の options を固定し、残りの標準属性・placeholder は汎用 Select にそのまま渡す。
// 見た目・属性転送は Select 側の責任なので、ここは「優先度という意味づけ」だけを担う（単一責任）。
export const PrioritySelect = ({ ...rest }: PrioritySelectProps) => {
    return <Select options={priorityOptions} {...rest} />
}
