import type { PatientRequest } from "../types/patientRequest"

export const patients = async () => {
    const response = await fetch('http://localhost:8080/api/patients', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    return response.json()
}

export const createPatient = async (patient: PatientRequest) => {
    const response = await fetch('http://localhost:8080/api/patients',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(patient)
    })

    return response.json()
}