import { Pagination } from "../pagination/Pagination";
import { User } from "../user/User";

export interface ActivityLog{
    _id: string,
    action: string,
    entity: string,
    entityId: User,
    userAgent: string
    details: {
        email:string,
        loginMethod: string
    }
    status: string
    requestMethod: string
    requestUrl: string
    createdAt: string
    pagination: Pagination
}