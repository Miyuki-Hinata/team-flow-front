import { getAccessToken } from './tokenStore'
import { fetchWithAuth , API_BASE_URL } from './apiClient'

export const categories = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/categories`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    return response.json()
}