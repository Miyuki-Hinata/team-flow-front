import type { Department } from '../types/department'
import type { User } from '../types/user'
import styled from 'styled-components'
import { Select } from './ui/Select'

type Props = {
    selectedDepartmentId: number | null,
    departments: Department[],
    onDepartmentChange: (value: number | null) => void,

    selectedDoctorId: number | null,
    doctors: User[],
    onDoctorChange: (value: number | null) => void
}

// フィルタの各セレクトを横並びにする器（TaskFilter と同じ方針）
const Filters = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${props => props.theme.spacing.sm};
`

const PatientFilter = ({
    selectedDepartmentId, departments, onDepartmentChange,
    selectedDoctorId, doctors, onDoctorChange
}: Props) => {

    // 部署・担当医は数値ID。Select は string を扱うので value/label とも string に変換して options を組み立てる
    const departmentOptions = departments.map(department => ({
        value: String(department.id),
        label: department.departmentName,
    }))

    const doctorOptions = doctors.map(doctor => ({
        value: String(doctor.id),
        label: doctor.lastName + ' ' + doctor.firstName,
    }))

    return (
        <Filters>
            {/* 部署絞り込み：placeholder で「部署：すべて」を先頭に。'' ⇔ null の変換は従来どおり維持 */}
            <Select
                placeholder="部署：すべて"
                options={departmentOptions}
                value={selectedDepartmentId === null ? '' : String(selectedDepartmentId)}
                onChange={(e) => onDepartmentChange(e.target.value === '' ? null : Number(e.target.value))}
            />

            {/* 担当医絞り込み：同上 */}
            <Select
                placeholder="担当医：すべて"
                options={doctorOptions}
                value={selectedDoctorId === null ? '' : String(selectedDoctorId)}
                onChange={(e) => onDoctorChange(e.target.value === '' ? null : Number(e.target.value))}
            />
        </Filters>
    )
}

export default PatientFilter
