export type TaskRequest = {
    title: string
    description?: string
    projectId?: number
    categoryId?: number
    patientId?: number
    assignedToAll: boolean
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    taskStatus: 'CREATED' | 'PROGRESS' | 'REVIEWING' | 'DONE'
    dueDate?: string
    assigneeIds?: number[]
}