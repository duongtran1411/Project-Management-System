import { Permission } from "../permission/Permission"

export interface Role{
    _id: string
    name:string
    description: string
    permissionIds: Permission[]
    createdAt: string
    updatedAt:string
}