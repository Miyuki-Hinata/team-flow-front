export type AnnouncementHistory = {
    id: number
    fieldName: string
    oldValue: string | null
    newValue: string | null
    changedAt: string
    changedBy: {
        id: number
        lastName: string
        firstName: string
    }
}
