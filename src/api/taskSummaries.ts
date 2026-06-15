import { fetchWithAuth } from "./apiClient"
import { getAccessToken } from "./tokenStore"

export const getTaskSummary = async (patientId: number) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/patients/${patientId}/summary`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })
    return response.json()
}

export const generateTaskSummary = async (patientId: number) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/patients/${patientId}/summary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })
    return response.json()
}