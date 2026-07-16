import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { patients as fetchPatients } from '../api/patients'
import { departments as fetchDepartments } from '../api/departments'
import type { Patient } from '../types/patient'
import type { Department } from '../types/department'
import type { User } from '../types/user'
import PatientListContainer from '../components/PatientListContainer'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'

// 「＋」アイコン：新規作成ボタン用。stroke="currentColor" で親（Button の onBrand 白）を継承する
const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const PatientPage = () => {
    const navigate = useNavigate()
    const [patients, setPatients] = useState<Patient[]>([])
    const [departments, setDepartments] = useState<Department[]>([])

    useEffect(() => {
        fetchPatients().then(data => {
            setPatients(data)
        })
        fetchDepartments().then(data => {
            setDepartments(data)
        })
    }, [])

    // 患者リストから、重複を除いた担当医の一覧を作る（PatientFilter の担当医セレクトに渡す）。
    // 既存ロジックそのまま維持。
    const doctors: User[] = Array.from(
        new Map(
            patients
                .filter(p => p.doctor !== null)
                .map(p => [p.doctor.id, p.doctor])
        ).values()
    )

    return (
        <div>
            <PageHeader
                title="患者一覧"
                subtitle={`全 ${patients.length} 名`}
                action={
                    <Button variant="primary" onClick={() => navigate('/patients/create')}>
                        <PlusIcon />
                        患者を追加
                    </Button>
                }
            />

            <PatientListContainer
                patients={patients}
                departments={departments}
                doctors={doctors}
            />
        </div>
    )
}

export default PatientPage
