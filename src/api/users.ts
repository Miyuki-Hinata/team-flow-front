import type { Role } from '../types/role'

export const users = async (role?: Role) => {
    const url = role
        ? `http://localhost:8080/api/users?role=${role}`
        : 'http://localhost:8080/api/users'
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    return response.json()
}

export const getCurrentUser = async () => {
    const response = await fetch('http://localhost:8080/api/users/me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    
    if (!response.ok) {
        throw new Error('ユーザー情報の取得に失敗しました');
    }
    
    return response.json();
};