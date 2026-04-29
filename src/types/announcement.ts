import type { Base } from './base'
import type { Category } from './category'
import type { Department } from "./department"
import type { Project } from "./project"

export type Announcement = Base & {
    id: number
    title: string
    description: string
    project: Project
    category: Category
    department: Department
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    expiredAt: string
    isRead: boolean
}