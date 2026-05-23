import type { Department } from '../types/department'
import type { User } from '../types/user'

type Props = {
    selectedDepartmentId: number | null,
    departments: Department[],
    onDepartmentChange: (value: number | null) => void,

    selectedDoctorId: number | null,
    doctors: User[],
    onDoctorChange: (value: number | null) => void
}


const PatientFilter = ({ selectedDepartmentId, departments, onDepartmentChange, selectedDoctorId, doctors, onDoctorChange }: Props) => {

    return (
        <div>
            <select
                value={selectedDepartmentId ?? ''}
                onChange={(e) => onDepartmentChange(e.target.value === '' ? null : Number(e.target.value))}
            >
                <option value="">すべて</option>
                    {
                        departments.map(department => (
                            <option key={department.id} value={department.id}>{department.departmentName}</option>

                        ))
                    }
            </select>
            <select
                value={selectedDoctorId ?? ''}
                onChange={(e) => onDoctorChange(e.target.value === '' ? null : Number(e.target.value))}
            >
                <option value="">すべて</option>
                {
                    doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>{doctor.lastName + " " + doctor.firstName}</option>
                    ))
                }
            </select>
        </div>
    )

}

export default PatientFilter