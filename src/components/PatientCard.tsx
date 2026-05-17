import type { Patient } from "../types/patient" 
import { Link } from 'react-router-dom'

type Props = {
    patient: Patient
}

const PatientCard = ({patient}: Props) => {
    return (
        <Link to={`/patients/${patient.id}`}>
            <div>
                <h2>{patient.lastName} {patient.firstName}</h2>
                <span>{patient.birth}</span>
                <span>{patient.sex}</span>
                <span>{patient.doctor?.lastName} {patient.doctor?.firstName}</span>
                <span>{patient.department?.departmentName}</span>
            </div>
        </Link>
    )
}

export default PatientCard