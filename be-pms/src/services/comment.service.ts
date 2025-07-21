import { Types } from "mongoose";
import { Comment, IComment, IUser } from "../models";
import cloudinary from "../utils/cloudinary";
import NotificationService from "./notification.service";
import { emitNewComment } from "../utils/socket";
import fs from "fs";
import path from "path";

class CommentService {
  async create(commentData: IComment, user: IUser): Promise<IComment> {
    const attachments = [];
    if (commentData.attachments) {
      for (const attachment of commentData.attachments) {
        // Kiểm tra nếu URL đã là Cloudinary URL thì không upload lại
        if (attachment.url.includes("cloudinary.com")) {
          attachments.push({
            filename: attachment.filename,
            url: attachment.url,
          });
        } else {
          // Nếu là local file path thì upload lên Cloudinary
          const result = await cloudinary.uploadImage(attachment.url, {
            public_id: `comments/${commentData.task}/${Date.now()}_${
              attachment.filename
            }`,
          });

          attachments.push({
            filename: result.original_filename,
            url: result.url,
          });
        }
      }
    }
    const comment = await Comment.create({
      content: commentData.content,
      task: commentData.task,
      author: user._id,
      mentions: commentData.mentions,
      attachments: attachments,
      isEdited: false,
    });

    // Create notifications for mentions
    if (commentData.mentions && commentData.mentions.length > 0) {
      try {
        for (const mentionedUserId of commentData.mentions) {
          if (mentionedUserId.toString() !== (user._id as string).toString()) {
            await NotificationService.createNotification({
              recipientId: mentionedUserId.toString(),
              senderId: user._id as string,
              type: "MENTION",
              entityType: "Comment",
              entityId: (comment._id as any).toString(),
              metadata: {
                commentText: commentData.content,
                taskId: commentData.task.toString(),
                mentionedUsers: [mentionedUserId.toString()],
              },
            });
          }
        }
      } catch (error) {
        console.error("Failed to create mention notifications:", error);
      }
    }

    // Emit realtime event for new comment
    try {
      const populatedComment = await Comment.findById(comment._id)
        .populate("author", "fullName avatar")
        .populate("mentions", "fullName avatar");

      emitNewComment(populatedComment, commentData.task.toString());
    } catch (error) {
      console.error("Failed to emit new comment event:", error);
    }

    return comment;
  }

  async getCommentByTask(taskId: string): Promise<IComment[]> {
    const comments = await Comment.aggregate([
      {
        $match: {
          task: new Types.ObjectId(taskId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          content: 1,
          author: {
            name: "$users.fullName",
            avatar: "$users.avatar",
          },
          task: 1,
          attachments: 1,
          mentions: 1,
          createdAt: 1,
          updatedAt: 1,
          isEdited: 1,
          editedAt: 1,
        },
      },
    ]);

    return comments;
  }

  async getTaskIdFromComment(commentId: string): Promise<string | null> {
    const comment = await Comment.findById(commentId).select("task");
    return comment ? comment.task.toString() : null;
  }

  async getCommentById(commentId: string): Promise<IComment | null> {
    const comment = await Comment.findById(commentId)
      .populate("author", "fullName avatar")
      .populate("mentions", "fullName avatar");
    return comment;
  }

  async uploadFilesToCloudinary(
    files: Express.Multer.File[]
  ): Promise<Array<{ filename: string; url: string }>> {
    const uploadedFiles = [];

    for (const file of files) {
      try {
        // Upload file lên Cloudinary
        let result;
        if (file.mimetype.startsWith("video/")) {
          result = await cloudinary.uploadVideo(file.path, {
            public_id: `comments/${Date.now()}_${file.filename}`,
          });
        } else {
          result = await cloudinary.uploadImage(file.path, {
            public_id: `comments/${Date.now()}_${file.filename}`,
          });
        }

        // Thêm thông tin file đã upload
        uploadedFiles.push({
          filename: file.originalname,
          url: result.url,
        });

        // Xóa file tạm sau khi upload
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        // Xóa file tạm nếu upload thất bại
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw new Error(`Upload file ${file.originalname} thất bại`);
      }
    }

    return uploadedFiles;
  }
}

export default new CommentService();
