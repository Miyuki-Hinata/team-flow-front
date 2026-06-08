import type { PatientRequest } from "../types/patientRequest"
import { getAccessToken } from './tokenStore'
import { fetchWithAuth } from './apiClient'

export const patients = async () => {
    const response = await fetchWithAuth('http://localhost:8080/api/patients', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    return response.json()
}

export const getPatientById = async (id: number) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/patients/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
    }

    return response.json()
}


export const createPatient = async (patient: PatientRequest) => {
    const response = await fetchWithAuth('http://localhost:8080/api/patients',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(patient)
    })

    return response.json()
}