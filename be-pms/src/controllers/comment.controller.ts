import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import commentService from "../services/comment.service";
import { emitNewComment, emitCommentDeleted } from "../utils/socket";
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

  // API update comment
  updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { commentId } = req.params;
      const { content, mentions } = req.body;
      const user = req.user;

      if (!commentId) {
        res.status(400).json({
          success: false,
          message: "Comment ID là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      if (!content || content.trim() === "") {
        res.status(400).json({
          success: false,
          message: "Content không được để trống",
          statusCode: 400,
        });
        return;
      }

      // Validate comment ID
      let commentObjectId: Types.ObjectId;
      try {
        commentObjectId = new Types.ObjectId(commentId);
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Comment ID không hợp lệ",
          statusCode: 400,
        });
        return;
      }

      // Kiểm tra comment có tồn tại và user có quyền edit không
      const existingComment = await commentService.getCommentById(commentId);
      if (!existingComment) {
        res.status(404).json({
          success: false,
          message: "Comment không tồn tại",
          statusCode: 404,
        });
        return;
      }

      // Kiểm tra quyền edit (chỉ author mới được edit)
      if (existingComment.author._id.toString() !== user._id.toString()) {
        res.status(403).json({
          success: false,
          message: "Bạn không có quyền chỉnh sửa comment này",
          statusCode: 403,
        });
        return;
      }

      // Xử lý mentions
      let processedMentions: Types.ObjectId[] = [];
      if (mentions) {
        if (Array.isArray(mentions)) {
          for (const item of mentions) {
            if (item && typeof item === "string" && item.trim() !== "") {
              try {
                processedMentions.push(new Types.ObjectId(item.trim()));
              } catch (error) {
                console.warn(`Invalid ObjectId: ${item}`);
              }
            }
          }
        } else if (typeof mentions === "string") {
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
            try {
              processedMentions.push(new Types.ObjectId(mentions.trim()));
            } catch (error) {
              console.warn(`Invalid ObjectId: ${mentions}`);
            }
          }
        }
      }

      // Update comment
      const updatedComment = await commentService.update(
        commentId,
        {
          content: content.trim(),
          mentions: processedMentions,
        },
        user
      );

      // Emit realtime event
      try {
        const populatedComment = await commentService.getCommentById(commentId);
        if (populatedComment) {
          emitNewComment(populatedComment, populatedComment.task.toString());
        }
      } catch (error) {
        console.error("Failed to emit updated comment event:", error);
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật comment thành công",
        data: {
          comment: updatedComment,
        },
      });
    } catch (error: any) {
      console.error("Update comment error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Cập nhật comment thất bại",
        statusCode: 500,
      });
    }
  };

  // API delete comment
  deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { commentId } = req.params;
      const user = req.user;

      if (!commentId) {
        res.status(400).json({
          success: false,
          message: "Comment ID là bắt buộc",
          statusCode: 400,
        });
        return;
      }

      // Validate comment ID
      let commentObjectId: Types.ObjectId;
      try {
        commentObjectId = new Types.ObjectId(commentId);
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Comment ID không hợp lệ",
          statusCode: 400,
        });
        return;
      }

      // Kiểm tra comment có tồn tại và user có quyền delete không
      const existingComment = await commentService.getCommentById(commentId);
      if (!existingComment) {
        res.status(404).json({
          success: false,
          message: "Comment không tồn tại",
          statusCode: 404,
        });
        return;
      }

      // Kiểm tra quyền delete (chỉ author mới được delete)
      if (existingComment.author._id.toString() !== user._id.toString()) {
        res.status(403).json({
          success: false,
          message: "Bạn không có quyền xóa comment này",
          statusCode: 403,
        });
        return;
      }

      // Delete comment
      await commentService.delete(commentId);

      // Emit realtime event
      try {
        emitCommentDeleted(commentId, existingComment.task.toString());
      } catch (error) {
        console.error("Failed to emit comment deleted event:", error);
      }

      res.status(200).json({
        success: true,
        message: "Xóa comment thành công",
        data: {
          commentId: commentId,
        },
      });
    } catch (error: any) {
      console.error("Delete comment error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Xóa comment thất bại",
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
