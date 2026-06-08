import { getAccessToken } from './tokenStore'
import { fetchWithAuth } from './apiClient'

export const projects = async () => {
    const response = await fetchWithAuth('http://localhost:8080/api/projects', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    return response.json()
}