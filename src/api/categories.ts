import type { Category } from '../types/category'
import { getAccessToken } from './tokenStore'
import { fetchWithAuth, API_BASE_URL, okOrThrow } from './apiClient'

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAccessToken()}`,
})

// 一覧取得（GET）
export const categories = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/categories`, {
        method: 'GET',
        headers: authHeaders(),
    })
    return response.json()
}

// 作成（POST）※admin のみ
export const createCategory = async (categoryName: string): Promise<Category> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ categoryName }),
    })
    await okOrThrow(response, 'カテゴリの作成に失敗しました')
    return response.json()
}

// 更新（PUT）
export const updateCategory = async (id: number, categoryName: string): Promise<Category> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ categoryName }),
    })
    await okOrThrow(response, 'カテゴリの更新に失敗しました')
    return response.json()
}

// 削除（DELETE・論理削除）
export const deleteCategory = async (id: number): Promise<void> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    })
    await okOrThrow(response, 'カテゴリの削除に失敗しました')
}
