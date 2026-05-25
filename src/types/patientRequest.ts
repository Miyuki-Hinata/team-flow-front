export type PatientRequest = {
    lastName: string
    firstName: string
    lastNameKana: string
    firstNameKana:string
    birth: string
    sex: string
    address: string
    tel?: string
    emergencyContactName: string
    emergencyContactTel: string
    doctorId?: number
    departmentId?: number
}