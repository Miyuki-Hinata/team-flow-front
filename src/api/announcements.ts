import { getAccessToken } from './tokenStore'
import { fetchWithAuth } from './apiClient'
import type { AnnouncementRequest } from '../types/announcementRequest'

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
    // 既読化は結果値を必要としないため、レスポンスは受け取らない（fire-and-forget）
    await fetchWithAuth(`http://localhost:8080/api/announcements/${id}/read`,{
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

export const getMyAnnouncements = async () => {
    const response = await fetchWithAuth('http://localhost:8080/api/announcements/my', {
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

export const getAnnouncementHistories = async (id: number) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/announcements/${id}/histories`, {
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

export const createAnnouncement = async (announcement: AnnouncementRequest) => {
    const response = await fetchWithAuth('http://localhost:8080/api/announcements', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(announcement)
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
    }

    return response.json()
}

export const updateAnnouncement = async (id: number, announcement: AnnouncementRequest) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/announcements/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(announcement)
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
    }

    return response.json()
}

export const deleteAnnouncement = async (id: number) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
    }
}