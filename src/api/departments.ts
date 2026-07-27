import type { Department } from '../types/department'
import { getAccessToken } from './tokenStore'
import { fetchWithAuth, API_BASE_URL, okOrThrow } from './apiClient'

// 認証付きの共通ヘッダ（各リクエストで使い回す）
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAccessToken()}`,
})

// 一覧取得（GET）
export const departments = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/departments`, {
        method: 'GET',
        headers: authHeaders(),
    })
    return response.json()
}

// 作成（POST）※admin のみ許可される（サーバー側で認可）
export const createDepartment = async (departmentName: string): Promise<Department> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/departments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ departmentName }),
    })
    await okOrThrow(response, '部署の作成に失敗しました')
    return response.json()
}

// 更新（PUT）
export const updateDepartment = async (id: number, departmentName: string): Promise<Department> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/departments/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ departmentName }),
    })
    await okOrThrow(response, '部署の更新に失敗しました')
    return response.json()
}

// 削除（DELETE・論理削除）。本文は使わないので okOrThrow で成否だけ確認
export const deleteDepartment = async (id: number): Promise<void> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/departments/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    })
    await okOrThrow(response, '部署の削除に失敗しました')
}
