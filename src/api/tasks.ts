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