import { User } from "../user/User"

export interface ProjectContributorTag {
    _id: string
    userId: User
    joinedAt: string
    projectRoleId: ProjectRoleTag
}

export interface ProjectRoleTag {
    _id: string
    name: string
}