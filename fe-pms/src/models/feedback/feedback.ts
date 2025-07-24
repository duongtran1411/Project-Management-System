import { User } from "../user/user.model";

export interface FeedBack{
    _id:string,
    email: string,
    message:string,
    avatar:string,
    type:string,
    createdAt:string,
    updatedAt:string,
    createdBy: User,
    projectContributorId: {
        _id:string
        userId:User
    }
}