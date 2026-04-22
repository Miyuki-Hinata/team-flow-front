import type { Base } from './base'
import type { Department } from './department'

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
}