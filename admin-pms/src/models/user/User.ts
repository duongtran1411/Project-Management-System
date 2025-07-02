import { Role } from "../role/Role";

export interface User{
    _id: string,
    fullName: string,
    email: string,
    avatar: string,
    status: string,
    failedLoginAttempts: number,
    verified: boolean,
    role: Role,
    lastLogin: string,
    createdAt: string,
    updatedAt: string
}