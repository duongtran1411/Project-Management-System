export interface User{
    _id: string,
    fullName: string,
    email: string,
    avatar: string,
    status: string,
    failedLoginAttempts: number,
    verified: boolean,
    role: string,
    lastLogin: string,
    createdAt: string,
    updatedAt: string
}