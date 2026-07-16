import { getAccessToken } from './tokenStore'
import { fetchWithAuth , API_BASE_URL } from './apiClient'
export const departments = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/departments`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    return response.json()
}