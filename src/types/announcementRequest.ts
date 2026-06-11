export type AnnouncementRequest = {
    title: string
    description?: string
    projectId?: number
    categoryId?: number
    departmentId?: number
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    expiredAt?: string
}
