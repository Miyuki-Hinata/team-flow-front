import type { Base } from './base'
import type { Department } from './department'
import type { User } from './user'

export type Sex = 'MALE'| 'FEMALE' | 'UNKNOWN' 

export type AgeGroup = 'child' | 'adult' | 'elderly'


export type Patient = Base & {
    id: number
    lastName: string
    firstName: string
    lastNameKana: string
    firstNameKana: string
    birth: string
    sex: Sex
    address: string
    tel: string
    emergencyContactName: string
    emergencyContactTel: string
    doctor: User
    department: Department
}