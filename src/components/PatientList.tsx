import type { Patient } from '../types/patient'
import PatientCard from './PatientCard'

type Props = {
    patients: Patient[]
}

const PatientList = ({ patients }: Props) => {
    return (
        <div>
            {
                patients.map(patient => (
                    <PatientCard key={patient.id} patient={patient}/>
                ))
            }
        </div>
    )
}

export default PatientList