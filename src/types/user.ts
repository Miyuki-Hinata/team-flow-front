import type { Base } from './base'
import type { Department } from './department'
import type { Role } from './role'

export type User = Base & {
    id: number
    loginId: string
    lastName: string
    firstName: string
    lastNameKana: string
    firstNameKana: string
    email: string
    department: Department
    level: number
    role: Role
}