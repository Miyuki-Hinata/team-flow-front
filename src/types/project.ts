import type { Base } from './base'
import type { Department } from './department'

export type Project = Base & {
    id: number
    projectName: string
    department: Department
}