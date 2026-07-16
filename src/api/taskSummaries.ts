import { fetchWithAuth, API_BASE_URL } from "./apiClient"
import { getAccessToken } from "./tokenStore"

export const getTaskSummary = async (patientId: number) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/patients/${patientId}/summary`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })
    return response.json()
}

export const generateTaskSummary = async (patientId: number) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/patients/${patientId}/summary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })
    return response.json()
}