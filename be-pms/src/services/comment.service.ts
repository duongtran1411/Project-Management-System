import { Types } from "mongoose";
import { Comment, IComment, IUser } from "../models";
import cloudinary from "../utils/cloudinary";

class CommentService {

    async create(commentData: IComment, user: IUser): Promise<IComment> {
        const attachments = []
        if (commentData.attachments) {
            for (const image of commentData.attachments) {
                const result = await cloudinary.uploadImage(image.url,
                    { public_id: `comments/${commentData.task}/${Date.now()}_${image.filename}` })

                attachments.push({
                    filename: result.original_filename,
                    url: result.url
                })
            }
        }
        const comment = await Comment.create({
            content: commentData.content,
            task: commentData.task,
            author: user._id,
            mentions: commentData.mentions,
            attachments: attachments,
            isEdited: false
        })

        return comment
    }

    async getCommentByTask(taskId: string): Promise<IComment[]> {
        const comments = await Comment.aggregate([
            {
                $match: {
                    task: new Types.ObjectId(taskId)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            {
                $unwind: {
                    path: '$users',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    content: 1,
                    author: {
                        name: '$users.fullName',
                        avatar: '$users.avatar'
                    },
                    task: 1
                }
            }
        ])

        return comments
    }
}

export default new CommentService();