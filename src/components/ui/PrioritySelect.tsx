// components/ui/PrioritySelect.tsx
import { Select } from './Select'
import { PRIORITY_OPTIONS } from '../../utils/task'

// PrioritySelect が受け取る props。
// 標準の <select> 属性（value / onChange / disabled など）は継承しつつ、
// options は内部で固定するので受け取らない。placeholder だけ任意で足す
// （<select> 自体は placeholder 属性を持たないため独自に追加する）。
type PrioritySelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    placeholder?: string
}

// PrioritySelect 本体。
// 優先度固有の options（utils/task.ts で一元管理）を固定し、
// 残りの標準属性・placeholder は汎用 Select にそのまま渡す。
// 見た目・属性転送は Select 側の責任なので、ここは「優先度という意味づけ」だけを担う（単一責任）。
export const PrioritySelect = ({ ...rest }: PrioritySelectProps) => {
    return <Select options={PRIORITY_OPTIONS} {...rest} />
}
