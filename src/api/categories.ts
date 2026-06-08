import { getAccessToken } from './tokenStore'
import { fetchWithAuth } from './apiClient'

export const categories = async () => {
    const response = await fetchWithAuth('http://localhost:8080/api/categories', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    return response.json()
}