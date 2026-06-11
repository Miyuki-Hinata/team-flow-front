import type { Role } from './role'

export type UserResponse = {
    id: number;
    lastName: string;
    firstName: string;
    role: Role;
    departmentId: number | null;
    departmentName: string | null;
    admin: boolean;
};