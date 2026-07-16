import { useState } from 'react'
import styled from 'styled-components'
import PatientFilter from './PatientFilter'
import PatientList from './PatientList'
import { Card } from './ui/Card'
import type { Patient } from '../types/patient'
import type { Department } from '../types/department'
import type { User } from '../types/user'

type Props = {
    patients: Patient[]
    departments: Department[]
    doctors: User[]
}

// フィルタと一覧を縦積み＋間隔（他一覧系と揃えて一体感）
const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
`

const PatientListContainer = ({ patients, departments, doctors }: Props) => {
    // 患者名検索クエリ（入力欄と絞り込みロジックが参照する単一の情報源）
    const [query, setQuery] = useState<string>('')
    const [filterDepartmentID, setFilterDepartment] = useState<number | null>(null)
    const [filterDoctorID, setFilterDoctor] = useState<number | null>(null)

    // クエリを正規化：空白を除去して小文字化して部分一致に強くする
    // （フルネームで入力しても、姓と名を続けて入力しても、カナ入力でも当たるように）
    const normalizedQuery = query.replace(/\s+/g, '').toLowerCase()

    const filteredPatients = patients.filter(patient => {
        // 名前・かなを結合して正規化し、正規化済みクエリで部分一致
        const nameNormalized = (
            patient.lastName + patient.firstName +
            patient.lastNameKana + patient.firstNameKana
        ).replace(/\s+/g, '').toLowerCase()
        const queryMatch = normalizedQuery === '' || nameNormalized.includes(normalizedQuery)

        const departmentMatch = filterDepartmentID === null || patient.department.id === filterDepartmentID
        const doctorMatch = filterDoctorID === null || patient.doctor.id === filterDoctorID
        return queryMatch && departmentMatch && doctorMatch
    })

    return (
        <Container>
            {/*
              フィルタバーを白カード枠（Card）で囲む。
              Card は padding: spacing.md(16px) / border-radius: radius.lg(12px) で、
              デザインの「padding:16px; border-radius:12px」と一致するためそのまま流用できる。
            */}
            <Card>
                <PatientFilter
                    query={query}
                    onQueryChange={setQuery}
                    departments={departments}
                    selectedDepartmentId={filterDepartmentID}
                    onDepartmentChange={setFilterDepartment}
                    doctors={doctors}
                    selectedDoctorId={filterDoctorID}
                    onDoctorChange={setFilterDoctor}
                />
            </Card>

            <PatientList patients={filteredPatients} />
        </Container>
    )
}

export default PatientListContainer
