import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import commentService from "../services/comment.service";
import { emitNewComment } from "../utils/socket";
import { IComment } from "../models/comment.model";
import { Types } from "mongoose";

class CommentController {
  createComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { content, task, mentions } = req.body;
      const user = req.user;

      if (!content || !task) {
        res.status(400).json({
          success: false,
          message: "Content và task là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      // Validate task ID
      let taskId: Types.ObjectId;
      try {
        taskId = new Types.ObjectId(task);
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Task ID không hợp lệ",
          statusCode: 400,
        });
        return;
      }

      let attachments: Array<{ filename: string; url: string }> = [];

      // Xử lý files được upload (nếu có)
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const files = req.files as Express.Multer.File[];
        const uploadedFiles = await commentService.uploadFilesToCloudinary(
          files
        );
        attachments = uploadedFiles;
      }

      // Xử lý mentions - đảm bảo là array ObjectId
      let processedMentions: Types.ObjectId[] = [];
      if (mentions) {
        if (Array.isArray(mentions)) {
          // Xử lý từng item trong array
          for (const item of mentions) {
            if (item && typeof item === "string" && item.trim() !== "") {
              // Kiểm tra nếu item chứa dấu phẩy (nhiều IDs)
              if (item.includes(",")) {
                const ids = item.split(",").map((id) => id.trim());
                for (const id of ids) {
                  try {
                    processedMentions.push(new Types.ObjectId(id));
                  } catch (error) {
                    console.warn(`Invalid ObjectId: ${id}`);
                  }
                }
              } else {
                // Single ID
                try {
                  processedMentions.push(new Types.ObjectId(item.trim()));
                } catch (error) {
                  console.warn(`Invalid ObjectId: ${item}`);
                }
              }
            }
          }
        } else if (typeof mentions === "string") {
          // Nếu là string, thử parse JSON hoặc split
          try {
            const parsed = JSON.parse(mentions);
            if (Array.isArray(parsed)) {
              for (const id of parsed) {
                if (id && typeof id === "string" && id.trim() !== "") {
                  try {
                    processedMentions.push(new Types.ObjectId(id.trim()));
                  } catch (error) {
                    console.warn(`Invalid ObjectId: ${id}`);
                  }
                }
              }
            } else {
              try {
                processedMentions.push(new Types.ObjectId(mentions.trim()));
              } catch (error) {
                console.warn(`Invalid ObjectId: ${mentions}`);
              }
            }
          } catch {
            // Nếu không parse được JSON, coi như là single user ID
            try {
              processedMentions.push(new Types.ObjectId(mentions.trim()));
            } catch (error) {
              console.warn(`Invalid ObjectId: ${mentions}`);
            }
          }
        }
      }

      // Tạo comment với attachments
      const commentData: Partial<IComment> = {
        content,
        task: taskId,
        mentions: processedMentions,
        attachments,
      };

      const newComment = await commentService.create(
        commentData as IComment,
        user
      );

      // Emit realtime event
      try {
        const populatedComment = await commentService.getCommentById(
          (newComment._id as any).toString()
        );
        if (populatedComment) {
          emitNewComment(populatedComment, task);
        }
      } catch (error) {
        console.error("Failed to emit new comment event:", error);
      }

      res.status(201).json({
        success: true,
        message: "Tạo comment thành công",
        data: {
          comment: newComment,
        },
      });
    } catch (error: any) {
      console.error("Create comment error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Tạo comment thất bại",
        statusCode: 500,
      });
    }
  };

  // API lấy comments của task
  getCommentTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { taskId } = req.params;
      if (!taskId) {
        res.status(400).json({
          status: 400,
          success: false,
          message: `task id : ${taskId} may be deleted`,
        });
        return;
      }
      const comments = await commentService.getCommentByTask(taskId);

      res.status(200).json({
        status: 200,
        message: "get data comment successful",
        success: true,
        data: comments,
      });
    } catch (error: any) {
      console.error("Get comments error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Lấy comments thất bại",
        statusCode: 400,
      });
    }
  };
}

export default new CommentController();
