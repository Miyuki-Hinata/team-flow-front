import type { Patient } from '../types/patient'
import { PatientCard }  from './ui/PatientCard'
import { Link } from "react-router-dom"

type Props = {
    patients: Patient[]
}

const PatientList = ({ patients }: Props) => {
    return (
        <div>
            {
                patients.map(patient => (
                    <Link to={`/patients/${patient.id}`}  key={patient.id}>
                        <PatientCard patient={patient}/>
                    </Link>
                ))
            }
        </div>
    )
}

export default PatientList