import { useState, useEffect } from 'react'
import { patients as fetchPatients } from "../api/patients"
import { departments as fetchDepartments } from '../api/departments'
import type { Patient } from '../types/patient'
import type { Department } from '../types/department'
import type { User } from '../types/user'

import PatientListContainer from '../components/PatientListContainer'
import { Link } from 'react-router-dom'


const PatientPage = () => {
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

    // 患者から医師を抽出
    const doctors: User[] = Array.from(
        new Map(
            patients
                .filter(p => p.doctor !== null)
                .map(p => [p.doctor.id, p.doctor])
        ).values()
    )

    return (
        <div>
            <Link to="/patients/create">患者作成</Link>
            <PatientListContainer
                patients={patients}
                departments={departments}
                doctors={doctors}
            />
        </div>
    )

}

export default PatientPage