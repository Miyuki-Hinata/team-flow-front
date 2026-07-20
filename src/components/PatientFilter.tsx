import type { Department } from '../types/department'
import type { User } from '../types/user'
import styled from 'styled-components'
import { Select } from './ui/Select'
import { Input } from './ui/Input'
import { FilterBar } from './ui/FilterBar'

type Props = {
    query: string,
    onQueryChange: (value: string) => void,

    selectedDepartmentId: number | null,
    departments: Department[],
    onDepartmentChange: (value: number | null) => void,

    selectedDoctorId: number | null,
    doctors: User[],
    onDoctorChange: (value: number | null) => void
}

// フィルタ全体のレイアウトは汎用 `ui/FilterBar` を使用。styled 定義は削除済み

// 検索欄の器：Input の左に虫眼鏡アイコンを重ねるための relative コンテナ。
// flex-basis 240px で程よい幅、Select と同じ行に自然に並ぶ。
const SearchWrapper = styled.div`
    position: relative;
    flex: 0 1 240px;
    min-width: 200px;
`

// 虫眼鏡アイコン：Input の左端に絶対配置。pointer-events:none で入力を妨げない
const SearchIconWrap = styled.span`
    position: absolute;
    left: ${props => props.theme.spacing.sm};
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    color: ${props => props.theme.colors.text.muted};
    pointer-events: none;
`

// 検索 Input：虫眼鏡アイコン分だけ左パディングを広げる。
// 通常の Input は padding-left が spacing.md(16px)。アイコン18px + 前後の余白分を確保する。
const SearchInput = styled(Input)`
    width: 100%;
    padding-left: calc(${props => props.theme.spacing.md} + 18px + ${props => props.theme.spacing.xs});
`

// 虫眼鏡 SVG（Sidebar / AppHeader と同じ currentColor パターン）
const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
)

const PatientFilter = ({
    query, onQueryChange,
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
        <FilterBar>
            {/* 患者名検索：虫眼鏡アイコン付き Input */}
            <SearchWrapper>
                <SearchIconWrap>
                    <SearchIcon />
                </SearchIconWrap>
                <SearchInput
                    type="text"
                    placeholder="患者名で検索"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                />
            </SearchWrapper>

            <Select
                placeholder="部署：すべて"
                options={departmentOptions}
                value={selectedDepartmentId === null ? '' : String(selectedDepartmentId)}
                onChange={(e) => onDepartmentChange(e.target.value === '' ? null : Number(e.target.value))}
            />

            <Select
                placeholder="担当医：すべて"
                options={doctorOptions}
                value={selectedDoctorId === null ? '' : String(selectedDoctorId)}
                onChange={(e) => onDoctorChange(e.target.value === '' ? null : Number(e.target.value))}
            />
        </FilterBar>
    )
}

export default PatientFilter
