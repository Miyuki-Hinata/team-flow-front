import type { TaskRequest } from "../types/taskRequest"
import { getAccessToken } from './tokenStore'
import { fetchWithAuth } from './apiClient'

export const tasks = async () => {
    const response = await fetchWithAuth('http://localhost:8080/api/tasks', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    return response.json()
}

export const getTaskById = async (id:number) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/tasks/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    // 404の場合はエラーをthrowする
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
    }

    return response.json()
}

export const getTasksByPatientId = async (id: number) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/tasks/patient/${id}`, {
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

export const updateTask = async (id:number, task: TaskRequest) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(task)
    })

    return response.json()
}

export const createTask = async (task: TaskRequest) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(task)
    })

    if (!response.ok) {
        throw new Error(`タスク作成に失敗しました (${response.status})`)
    }

    return response.json()
}

export const deleteTask = async (id: number) => {
    // 削除は結果値を必要としないため、レスポンスは受け取らない（fire-and-forget）
    await fetchWithAuth(`http://localhost:8080/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })
}

export const getTaskHistories = async (id: number) => {
    const response = await fetchWithAuth(`http://localhost:8080/api/tasks/${id}/histories`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })
    return response.json()
}

export const getMyTasks = async () => {
    const response = await fetchWithAuth(`http://localhost:8080/api/tasks/my-tasks`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        }
    })

    return response.json()
}