import type { Base } from './base'
import type { Category } from './category'
import type { Department } from "./department"
import type { Project } from "./project"
import type { UserResponse } from './userResponse'

export type Announcement = Base & {
    id: number
    title: string
    description: string
    project: Project | null
    category: Category
    department: Department | null
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    expiredAt: string
    isRead: boolean
    createdBy: UserResponse | null
}