import { useState, useEffect } from 'react'
import { patients as fetchPatients } from "../api/patients"
import type { Patient } from '../types/patient'
import PatientList from '../components/PatientList'


const PatientPage = () => {
    const [patients, setPatients] = useState<Patient[]>([])

    useEffect(() => {
        fetchPatients().then(data => {
            setPatients(data)
        })
    }, [])

    return (
        <div>
            <PatientList patients={patients}/>
        </div>
    )

}

export default PatientPage