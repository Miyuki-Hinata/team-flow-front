import { useState } from 'react'
import PatientFilter from './PatientFilter'
import PatientList from './PatientList'
import type { Patient } from '../types/patient'
import type { Department } from '../types/department'
import type { User } from '../types/user'

type Props = {
    patients: Patient[]
    departments: Department[]
    doctors: User[]
}

const PatientListContainer = ({ patients, departments, doctors }: Props) => {
    const [filterDepartmentID, setFilterDepartment] = useState<number | null>(null)

    const [filterDoctorID, setFilterDoctor] = useState<number | null>(null)

    const filteredPatients = patients.filter(
        patient => {
            const departmentMatch = filterDepartmentID === null || patient.department.id === filterDepartmentID

            const doctorMatch = filterDoctorID === null || patient.doctor.id === filterDoctorID

            return departmentMatch && doctorMatch
        }
    )

    return (
        <div>
            <PatientFilter departments={departments} selectedDepartmentId={filterDepartmentID} onDepartmentChange={setFilterDepartment} doctors={doctors} selectedDoctorId={filterDoctorID} onDoctorChange={setFilterDoctor} />

            <PatientList patients={filteredPatients} />
        </div>
    )
}

export default PatientListContainer