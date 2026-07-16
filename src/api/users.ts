import type { Role } from '../types/role'
import { getAccessToken } from './tokenStore'
import { fetchWithAuth , API_BASE_URL } from './apiClient'

export const users = async (role?: Role) => {
    const url = role
        ? `${API_BASE_URL}/api/users?role=${role}`
        : `${API_BASE_URL}/api/users`
    
    const response = await fetchWithAuth(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })
    return response.json()
}

export const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/users/me/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
    }

    return response.json()
}

export const getCurrentUser = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    });
    
    if (!response.ok) {
        throw new Error('ユーザー情報の取得に失敗しました');
    }
    
    return response.json();
};