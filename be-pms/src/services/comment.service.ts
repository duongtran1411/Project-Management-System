import { Types } from "mongoose";
import { Comment, IComment, IUser, Task } from "../models";
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
            // Lấy thông tin task và project để truyền vào metadata
            const task = await Task.findById(commentData.task).populate(
              "projectId",
              "name"
            );
            const project = task?.projectId;

            await NotificationService.createNotification({
              recipientId: mentionedUserId.toString(),
              senderId: user._id as string,
              type: "MENTION",
              entityType: "Comment",
              entityId: (comment._id as any).toString(),
              metadata: {
                commentText: commentData.content,
                taskId: commentData.task.toString(),
                projectId: project?._id?.toString(),
                projectName:
                  typeof project === "object" && project && "name" in project
                    ? (project as any).name
                    : undefined,
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

  async update(
    commentId: string,
    updateData: { content: string; mentions: Types.ObjectId[] },
    user: IUser
  ): Promise<IComment> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment không tồn tại");
    }

    // Kiểm tra quyền edit (chỉ author mới được edit)
    if (comment.author.toString() !== (user._id as string).toString()) {
      throw new Error("Bạn không có quyền chỉnh sửa comment này");
    }

    // Update comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content: updateData.content,
        mentions: updateData.mentions,
        isEdited: true,
        editedAt: new Date(),
      },
      { new: true }
    )
      .populate("author", "fullName avatar")
      .populate("mentions", "fullName avatar");

    if (!updatedComment) {
      throw new Error("Cập nhật comment thất bại");
    }

    // Create notifications for new mentions
    if (updateData.mentions && updateData.mentions.length > 0) {
      try {
        for (const mentionedUserId of updateData.mentions) {
          if (mentionedUserId.toString() !== (user._id as string).toString()) {
            // Lấy thông tin task và project để truyền vào metadata
            const task = await Task.findById(comment.task).populate(
              "projectId",
              "name"
            );
            const project = task?.projectId;

            await NotificationService.createNotification({
              recipientId: mentionedUserId.toString(),
              senderId: user._id as string,
              type: "MENTION",
              entityType: "Comment",
              entityId: commentId,
              metadata: {
                commentText: updateData.content,
                taskId: comment.task.toString(),
                projectId: project?._id?.toString(),
                projectName:
                  typeof project === "object" && project && "name" in project
                    ? (project as any).name
                    : undefined,
                mentionedUsers: [mentionedUserId.toString()],
              },
            });
          }
        }
      } catch (error) {
        console.error("Failed to create mention notifications:", error);
      }
    }

    return updatedComment;
  }

  async delete(commentId: string): Promise<void> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment không tồn tại");
    }

    // Xóa attachments trên Cloudinary nếu có
    if (comment.attachments && comment.attachments.length > 0) {
      try {
        for (const attachment of comment.attachments) {
          if (attachment.url.includes("cloudinary.com")) {
            // Extract public_id from URL
            const urlParts = attachment.url.split("/");
            const publicId = urlParts[urlParts.length - 1].split(".")[0];
            await cloudinary.deleteImage(publicId);
          }
        }
      } catch (error) {
        console.error("Failed to delete attachments from Cloudinary:", error);
      }
    }

    // Xóa comment
    await Comment.findByIdAndDelete(commentId);
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
