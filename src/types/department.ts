import type { Base } from './base'

export type Department = Base & {
    id: number
    departmentName: string
}