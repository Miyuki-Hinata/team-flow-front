import { getAccessToken } from './tokenStore'
import { fetchWithAuth , API_BASE_URL } from './apiClient'
import type { AnnouncementRequest } from '../types/announcementRequest'
import type { Announcement } from '../types/announcement'

// 戻り値の型を明示する。response.json() は Promise<any> のため、
// 省略すると any が呼び出し側へ連鎖し、型チェックが効かなくなる
export const announcements = async (): Promise<Announcement[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/announcements`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    // 401 等のときは body が空になるため、そのまま response.json() を呼ぶと
    // SyntaxError（Unexpected end of JSON input）が起きる。他の API と揃えて明示的に throw する。
    if (!response.ok) {
        throw new Error(`お知らせの取得に失敗しました (status: ${response.status})`)
    }
    return response.json()
}

export const markAsRead = async (id: number) => {
    // 既読化は結果値を必要としないため、レスポンスは受け取らない（fire-and-forget）
    await fetchWithAuth(`${API_BASE_URL}/api/announcements/${id}/read`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })
}

export const getAnnouncementById = async (id: number) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/announcements/${id}`,{
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
    const response = await fetchWithAuth(`${API_BASE_URL}/api/announcements/my`, {
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
    const response = await fetchWithAuth(`${API_BASE_URL}/api/announcements/${id}/histories`, {
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
    const response = await fetchWithAuth(`${API_BASE_URL}/api/announcements`, {
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
    const response = await fetchWithAuth(`${API_BASE_URL}/api/announcements/${id}`, {
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
    const response = await fetchWithAuth(`${API_BASE_URL}/api/announcements/${id}`, {
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