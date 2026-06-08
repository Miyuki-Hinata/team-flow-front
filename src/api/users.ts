import type { Role } from '../types/role'
import { getAccessToken } from './tokenStore'
import { fetchWithAuth } from './apiClient'

export const users = async (role?: Role) => {
    const url = role
        ? `http://localhost:8080/api/users?role=${role}`
        : 'http://localhost:8080/api/users'
    
    const response = await fetchWithAuth(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })
    return response.json()
}

export const getCurrentUser = async () => {
    const response = await fetchWithAuth('http://localhost:8080/api/users/me', {
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