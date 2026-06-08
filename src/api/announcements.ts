import { getAccessToken } from './tokenStore'
import { fetchWithAuth } from './apiClient'
export const announcements = async () => {
    const response = await fetchWithAuth('http://localhost:8080/api/announcements', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })
    return response.json()
}

export const markAsRead = async (id: number) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/announcements/${id}/read`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })
}

export const getAnnouncementById = async (id: number) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/announcements/${id}`,{
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