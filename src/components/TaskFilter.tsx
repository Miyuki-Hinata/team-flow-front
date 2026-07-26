import type { Priority, TaskStatus } from "../types/task"
import type { Department } from "../types/department"
import type { User } from "../types/user"
import { TaskStatusSelect } from './ui/TaskStatusSelect'
import { PrioritySelect } from './ui/PrioritySelect'
import { Select } from './ui/Select'
import { FilterBar } from './ui/FilterBar'

type Props = {
    status: TaskStatus | null,
    priority: Priority | null,
    onStatusChange: (value: TaskStatus | null) => void,
    onPriorityChange: (value: Priority | null) => void,

    // 部署・担当医フィルタ（任意）。渡されたときだけ表示する。
    // ※ MyTasksPage のように状態/優先度だけ使う画面でも壊れないよう optional にしている。
    departments?: Department[],
    selectedDepartmentId?: number | null,
    onDepartmentChange?: (value: number | null) => void,

    doctors?: User[],
    selectedDoctorId?: number | null,
    onDoctorChange?: (value: number | null) => void,
}

// タスク用のフィルタ。汎用 FilterBar に 状態 / 優先度 / 部署 / 担当医 のセレクトを載せる。
// 部署・担当医は患者由来（PatientFilter と同じく数値 ID を string 化して Select に渡す）。
const TaskFilter = ({
    status, priority, onStatusChange, onPriorityChange,
    departments, selectedDepartmentId, onDepartmentChange,
    doctors, selectedDoctorId, onDoctorChange,
}: Props) => {
    // Select は string を扱うので value/label とも string に変換（未指定なら空配列）
    const departmentOptions = (departments ?? []).map(d => ({
        value: String(d.id),
        label: d.departmentName,
    }))
    const doctorOptions = (doctors ?? []).map(d => ({
        value: String(d.id),
        label: `${d.lastName} ${d.firstName}`,
    }))

    return (
        <FilterBar>
            {/* ステータス絞り込み：placeholder="すべて" で空値(=絞り込み解除)の選択肢を先頭に出す。 */}
            <TaskStatusSelect
                placeholder="状態：すべて"
                value={status ?? ''}
                onChange={(e) => onStatusChange(e.target.value === '' ? null : e.target.value as TaskStatus)}
            />

            {/* 優先度絞り込み */}
            <PrioritySelect
                placeholder="優先度：すべて"
                value={priority ?? ''}
                onChange={(e) => onPriorityChange(e.target.value === '' ? null : e.target.value as Priority)}
            />

            {/* 部署絞り込み（対象患者の部署）。ハンドラが渡されたときだけ表示 */}
            {onDepartmentChange && (
                <Select
                    placeholder="部署：すべて"
                    options={departmentOptions}
                    value={selectedDepartmentId == null ? '' : String(selectedDepartmentId)}
                    onChange={(e) => onDepartmentChange(e.target.value === '' ? null : Number(e.target.value))}
                />
            )}

            {/* 担当医絞り込み（対象患者の担当医）。ハンドラが渡されたときだけ表示 */}
            {onDoctorChange && (
                <Select
                    placeholder="担当医：すべて"
                    options={doctorOptions}
                    value={selectedDoctorId == null ? '' : String(selectedDoctorId)}
                    onChange={(e) => onDoctorChange(e.target.value === '' ? null : Number(e.target.value))}
                />
            )}
        </FilterBar>
    )
}

export default TaskFilter
