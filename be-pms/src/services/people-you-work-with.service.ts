import { Request } from "express";
import User from "../models/user.model";
import ProjectContributor from "../models/project.contributor.model";
import Task from "../models/task.model";
import { AuthRequest } from "../middlewares/auth.middleware";

export interface IPeopleYouWorkWith {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  phone?: string;
  collaborationType: "project" | "task" | "both";
  lastCollaboration?: Date;
}

export class PeopleYouWorkWithService {
  /**
   * Lấy danh sách những người mà user hiện tại đã từng làm việc cùng
   */
  static async getPeopleYouWorkWith(
    req: AuthRequest
  ): Promise<IPeopleYouWorkWith[]> {
    const currentUserId = req.user._id;

    try {
      // 1. Lấy tất cả project mà user hiện tại đã tham gia
      const userProjects = await ProjectContributor.find({
        userId: currentUserId,
      }).distinct("projectId");

      // 2. Lấy tất cả user đã từng làm việc trong cùng project
      const projectCollaborators = await ProjectContributor.find({
        projectId: { $in: userProjects },
        userId: { $ne: currentUserId },
      }).distinct("userId");

      // 3. Lấy tất cả task mà user hiện tại đã được assign hoặc report
      const userTasks = await Task.find({
        $or: [
          { assignee: currentUserId },
          { reporter: currentUserId },
          { createdBy: currentUserId },
        ],
      }).distinct("projectId");

      // 4. Lấy tất cả user đã từng được assign hoặc report task trong cùng project
      const taskCollaborators = await Task.find({
        projectId: { $in: userTasks },
        $or: [
          { assignee: { $ne: currentUserId } },
          { reporter: { $ne: currentUserId } },
          { createdBy: { $ne: currentUserId } },
        ],
      }).distinct("assignee reporter createdBy");

      // 5. Gộp và loại bỏ trùng lặp
      const allCollaboratorIds = [
        ...new Set([...projectCollaborators, ...taskCollaborators]),
      ];

      // 6. Lấy thông tin chi tiết của các user
      const collaborators = await User.find({
        _id: { $in: allCollaboratorIds },
        status: "ACTIVE",
      }).select("fullName email avatar phone");

      // 7. Tạo response với thông tin collaboration
      const result: IPeopleYouWorkWith[] = [];

      for (const collaborator of collaborators) {
        const collaboratorId = (collaborator as any)._id.toString();

        // Kiểm tra xem user này có làm việc cùng trong project không
        const hasProjectCollaboration = projectCollaborators.some(
          (id: any) => id.toString() === collaboratorId
        );

        // Kiểm tra xem user này có làm việc cùng trong task không
        const hasTaskCollaboration = taskCollaborators.some(
          (id: any) => id.toString() === collaboratorId
        );

        let collaborationType: "project" | "task" | "both" = "project";
        if (hasProjectCollaboration && hasTaskCollaboration) {
          collaborationType = "both";
        } else if (hasTaskCollaboration) {
          collaborationType = "task";
        }

        // Lấy thời gian collaboration gần nhất
        let lastCollaboration: Date | undefined;

        if (hasProjectCollaboration) {
          const latestProjectCollaboration = await ProjectContributor.findOne({
            userId: collaboratorId,
            projectId: { $in: userProjects },
          }).sort({ joinedAt: -1 });

          if (latestProjectCollaboration) {
            lastCollaboration = latestProjectCollaboration.joinedAt;
          }
        }

        if (hasTaskCollaboration) {
          const latestTaskCollaboration = await Task.findOne({
            $or: [
              { assignee: collaboratorId },
              { reporter: collaboratorId },
              { createdBy: collaboratorId },
            ],
            projectId: { $in: userTasks },
          }).sort({ updatedAt: -1 });

          if (
            latestTaskCollaboration &&
            (!lastCollaboration ||
              latestTaskCollaboration.updatedAt > lastCollaboration)
          ) {
            lastCollaboration = latestTaskCollaboration.updatedAt;
          }
        }

        result.push({
          _id: (collaborator as any)._id.toString(),
          fullName: (collaborator as any).fullName,
          email: (collaborator as any).email,
          avatar: (collaborator as any).avatar,
          phone: (collaborator as any).phone,
          collaborationType,
          lastCollaboration,
        });
      }

      // Sắp xếp theo thời gian collaboration gần nhất
      return result.sort((a, b) => {
        if (!a.lastCollaboration && !b.lastCollaboration) return 0;
        if (!a.lastCollaboration) return 1;
        if (!b.lastCollaboration) return -1;
        return (
          new Date(b.lastCollaboration).getTime() -
          new Date(a.lastCollaboration).getTime()
        );
      });
    } catch (error) {
      console.error("Error in getPeopleYouWorkWith:", error);
      throw new Error("Failed to get people you work with");
    }
  }

  /**
   * Lấy danh sách những người đang làm việc cùng trong project hiện tại
   */
  static async getCurrentProjectCollaborators(
    req: AuthRequest,
    projectId: string
  ): Promise<IPeopleYouWorkWith[]> {
    const currentUserId = req.user._id;

    try {
      // Lấy tất cả contributor trong project hiện tại
      const projectContributors = await ProjectContributor.find({
        projectId: projectId,
        userId: { $ne: currentUserId },
      }).populate("userId", "fullName email avatar phone");

      // Lấy tất cả user đã từng được assign task trong project này
      const taskCollaborators = await Task.find({
        projectId: projectId,
        $or: [
          { assignee: { $ne: currentUserId } },
          { reporter: { $ne: currentUserId } },
          { createdBy: { $ne: currentUserId } },
        ],
      }).populate("assignee reporter createdBy", "fullName email avatar phone");

      // Gộp và loại bỏ trùng lặp
      const allCollaborators = new Map();

      // Thêm project contributors
      projectContributors.forEach((contributor) => {
        const user = contributor.userId as any;
        if (user) {
          allCollaborators.set(user._id.toString(), {
            _id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            avatar: user.avatar,
            phone: user.phone,
            collaborationType: "project" as const,
            lastCollaboration: contributor.joinedAt,
          });
        }
      });

      // Thêm task collaborators
      taskCollaborators.forEach((task) => {
        const taskData = task.toObject();
        const collaborators = [
          taskData.assignee,
          taskData.reporter,
          taskData.createdBy,
        ].filter(Boolean);

        collaborators.forEach((collaborator) => {
          if (
            collaborator &&
            collaborator._id.toString() !== currentUserId.toString()
          ) {
            const existing = allCollaborators.get(collaborator._id.toString());
            if (existing) {
              existing.collaborationType = "both";
              if (task.updatedAt > existing.lastCollaboration) {
                existing.lastCollaboration = task.updatedAt;
              }
            } else {
              allCollaborators.set((collaborator as any)._id.toString(), {
                _id: (collaborator as any)._id.toString(),
                fullName: (collaborator as any).fullName,
                email: (collaborator as any).email,
                avatar: (collaborator as any).avatar,
                phone: (collaborator as any).phone,
                collaborationType: "task" as const,
                lastCollaboration: task.updatedAt,
              });
            }
          }
        });
      });

      const result = Array.from(allCollaborators.values());

      // Sắp xếp theo thời gian collaboration gần nhất
      return result.sort((a, b) => {
        if (!a.lastCollaboration && !b.lastCollaboration) return 0;
        if (!a.lastCollaboration) return 1;
        if (!b.lastCollaboration) return -1;
        return (
          new Date(b.lastCollaboration).getTime() -
          new Date(a.lastCollaboration).getTime()
        );
      });
    } catch (error) {
      console.error("Error in getCurrentProjectCollaborators:", error);
      throw new Error("Failed to get current project collaborators");
    }
  }
}
