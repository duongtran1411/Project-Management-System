import { User } from "../user/User"

export interface ProjectContributor {
    _id: string
    userId: User
    joinedAt: string
    projectRoleId: ProjectRole
}

export interface ProjectRole {
    _id: string
    name: string
}