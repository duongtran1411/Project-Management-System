import { Response, Request } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import commentService from "../services/comment.service";

class CommentController {
    create = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const comment = req.body
            const user = req.user

            if (!comment) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid format data',
                    statusCode: 400,
                });
            }

            const newComment = await commentService.create(comment,user)

            res.status(201).json({
                status:201,
                message: 'Create comment successful',
                success: true,
                data: newComment
            })
        } catch (error: any) {
            console.error("Create task error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Tạo task thất bại",
                statusCode: 400,
            });
        }
    }

    getCommentTask = async (req:AuthRequest,res:Response):Promise<void> => {
        try {
            const {taskId} = req.params;
            if(!taskId){
                res.status(400).json({
                    status:400,
                    success:false,
                    message: `task id : ${taskId} may be deleted`
                })
            }
            const comments = await commentService.getCommentByTask(taskId)

            res.status(201).json({
                status:201,
                message: 'get data comment successful',
                success: true,
                data: comments
            })

        } catch (error: any) {
            console.error("Create task error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Tạo task thất bại",
                statusCode: 400,
            });
        }
    }
}

export default new CommentController();