import type { Sex } from './patient'

export type PatientRequest = {
    lastName: string
    firstName: string
    lastNameKana: string
    firstNameKana:string
    birth: string
    // sex: '' は初期値（未選択）のみ許容。送信時にはバックエンドの Sex enum と一致する値のみ受け入れる。
    sex: Sex | ''
    address: string
    tel?: string
    emergencyContactName: string
    emergencyContactTel: string
    doctorId?: number
    departmentId?: number
}
