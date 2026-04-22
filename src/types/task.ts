import type { Base } from './base'
import type { Category } from './category'
import type { Patient } from './patient'
import type { Project } from './project'
import type { User } from './user'

export type Task = Base & {
    id: number
    title: string
    description: string
    project: Project
    category: Category
    patient: Patient
    assignedToAll: boolean
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    taskStatus: 'CREATED' | 'PROGRESS' | 'REVIEWING' | 'DONE'
    dueDate: string
    assignees: User[]
    relatedTasks: Task[]
}