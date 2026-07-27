import type { Project } from '../types/project'
import { getAccessToken } from './tokenStore'
import { fetchWithAuth, API_BASE_URL, okOrThrow } from './apiClient'

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAccessToken()}`,
})

// プロジェクト作成/更新で送るデータ。サーバーの ProjectRequest（projectName, departmentId）に対応。
// ※作成/更新とも「どの部署のプロジェクトか」を departmentId で指定する
type ProjectInput = {
    projectName: string
    departmentId: number
}

// 一覧取得（GET）
export const projects = async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/projects`, {
        method: 'GET',
        headers: authHeaders(),
    })
    return response.json()
}

// 作成（POST）※admin のみ
export const createProject = async (input: ProjectInput): Promise<Project> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(input),
    })
    await okOrThrow(response, 'プロジェクトの作成に失敗しました')
    return response.json()
}

// 更新（PUT）
export const updateProject = async (id: number, input: ProjectInput): Promise<Project> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(input),
    })
    await okOrThrow(response, 'プロジェクトの更新に失敗しました')
    return response.json()
}

// 削除（DELETE・論理削除）
export const deleteProject = async (id: number): Promise<void> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    })
    await okOrThrow(response, 'プロジェクトの削除に失敗しました')
}
