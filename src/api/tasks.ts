import type { TaskRequest } from "../types/taskRequest"

export const tasks = async () => {
    const response = await fetch('http://localhost:8080/api/tasks', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    return response.json()
}

export const getTaskById = async (id:number) => {
    const response = await fetch(`http://localhost:8080/api/tasks/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    const response = await fetch(`http://localhost:8080/api/tasks/patient/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
    }

    return response.json()
}

export const updateTask = async (id:number, task: TaskRequest) => {
    const response = await fetch(`http://localhost:8080/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(task)
    })

    return response.json()
}

export const createTask = async (task: TaskRequest) => {
    const response = await fetch(`http://localhost:8080/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(task)
    })

    return response.json()
}

export const deleteTask = async (id: number) => {
    const response = await fetch(`http://localhost:8080/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
}

export const getMyTasks = async () => {
    const response = await fetch(`http://localhost:8080/api/tasks/my-tasks`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    return response.json()
}