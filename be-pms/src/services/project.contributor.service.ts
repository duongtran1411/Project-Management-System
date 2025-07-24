import ProjectContributor, {
  IProjectContributor,
  ProjectInvitation,
  IProjectInvitation,
} from "../models/project.contributor.model";
import User, { IUser } from "../models/user.model";
import Project from "../models/project.model";
import ProjectRole, { IProjectRole } from "../models/project.role.model";
import mongoose from "mongoose";
import { sendProjectInvitationEmail } from "../utils/email.util";
import crypto from "crypto";
import NotificationService from "./notification.service";
import workspaceService from "./workspace.service";

export class ProjectContributorService {
  private generateInvitationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  async sendProjectInvitation(
    email: string,
    projectId: string,
    projectRoleId: string,
    invitedBy: string
  ): Promise<any> {
    // Kiểm tra user có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`Email ${email} không tồn tại trong hệ thống.`);
    }

    // Kiểm tra project có tồn tại không
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Dự án không tồn tại.");
    }

    // Kiểm tra role có tồn tại không
    const role = await ProjectRole.findById(projectRoleId);
    if (!role) {
      throw new Error("Vai trò không tồn tại.");
    }

    // Kiểm tra đã có invitation pending chưa
    const existingInvitation = await ProjectInvitation.findOne({
      email,
      projectId,
      status: "pending",
    });

    if (existingInvitation) {
      throw new Error(
        `Đã có lời mời đang chờ xác nhận cho email ${email} trong dự án này.`
      );
    }

    // Kiểm tra đã là contributor chưa
    const existingContributor = await ProjectContributor.findOne({
      userId: user._id,
      projectId,
    });

    if (existingContributor) {
      throw new Error(`Người dùng ${email} đã là contributor của dự án này.`);
    }

    // Tạo invitation
    const token = this.generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 ngày

    const invitation = await ProjectInvitation.create({
      email,
      projectId,
      projectRoleId,
      invitedBy,
      token,
      expiresAt,
    });

    // Gửi email
    const inviter = await User.findById(invitedBy);
    const confirmUrl = `https://project-management-system-1ok8.vercel.app/create-project/invite-page/confirm-invite/${token}`;

    await sendProjectInvitationEmail(
      email,
      inviter?.fullName || "Người dùng",
      project.name,
      role.name,
      confirmUrl
    );

    // Create notification for invited user
    try {
      await NotificationService.createNotification({
        recipientId: (user._id as any).toString(),
        senderId: invitedBy,
        type: "PROJECT_UPDATE",
        entityType: "Project",
        entityId: projectId,
        metadata: {
          projectName: project.name,
          updateType: "invitation",
          updateDescription: "You have been invited to join this project",
        },
      });
    } catch (error) {
      console.error("Failed to create project invitation notification:", error);
    }

    return {
      invitation: invitation._id,
      message: `Đã gửi lời mời đến ${email}`,
    };
  }

  // Xác nhận invitation
  async confirmProjectInvitation(token: string): Promise<any> {
    const invitation = await ProjectInvitation.findOne({
      token,
      status: "pending",
    }).populate([
      { path: "projectId", select: "name" },
      { path: "projectRoleId", select: "name" },
    ]);

    if (!invitation) {
      throw new Error("Lời mời không tồn tại hoặc đã được xử lý.");
    }

    if (invitation.expiresAt < new Date()) {
      await ProjectInvitation.findByIdAndUpdate(invitation._id, {
        status: "expired",
      });
      throw new Error("Lời mời đã hết hạn.");
    }

    const user = await User.findOne({ email: invitation.email });
    if (!user) {
      throw new Error("Người dùng không tồn tại.");
    }

    // Kiểm tra xem user đã là contributor của project này chưa
    const existingContributor = await ProjectContributor.findOne({
      userId: user._id,
      projectId: invitation.projectId,
    });

    if (existingContributor) {
      // Nếu đã tồn tại, chỉ cập nhật role nếu khác
      if (
        existingContributor.projectRoleId.toString() !==
        invitation.projectRoleId.toString()
      ) {
        existingContributor.projectRoleId = invitation.projectRoleId;
        await existingContributor.save();
      }

      // Cập nhật status invitation
      await ProjectInvitation.findByIdAndUpdate(invitation._id, {
        status: "accepted",
      });

      return existingContributor.populate([
        { path: "userId", select: "fullName email avatar" },
        { path: "projectRoleId", select: "name" },
      ]);
    }

    // Tạo contributor mới nếu chưa tồn tại
    const contributor = await ProjectContributor.create({
      userId: user._id,
      projectId: invitation.projectId,
      projectRoleId: invitation.projectRoleId,
    });

    await ProjectInvitation.findByIdAndUpdate(invitation._id, {
      status: "accepted",
    });

    try {
      let workspace;
      try {
        workspace = await workspaceService.getWorkspaceByUser(user);
      } catch (err) {
        // Nếu chưa có workspace thì tạo mới
        workspace = await workspaceService.createWorkspace(
          {
            name: `${user.fullName || user.email}-workspace`,
            ownerId: user._id as any,
            projectIds: [invitation.projectId],
          },
          user
        );
      }
      // Nếu đã có workspace, kiểm tra và thêm project nếu chưa có
      if (
        workspace &&
        workspace.projectIds &&
        !workspace.projectIds
          .map((id: any) => id.toString())
          .includes(invitation.projectId.toString())
      ) {
        await workspaceService.addProjectToWorkspace(
          workspace._id.toString(),
          invitation.projectId.toString(),
          user
        );
      }
    } catch (err) {
      console.error("Failed to add project to user's workspace:", err);
    }

    return contributor.populate([
      { path: "userId", select: "fullName email avatar" },
      { path: "projectRoleId", select: "name" },
    ]);
  }

  // Gửi multiple invitations
  async sendMultipleProjectInvitations(
    emails: string[],
    projectId: string,
    projectRoleId: string,
    invitedBy: string
  ): Promise<{
    success: any[];
    errors: Array<{ email: string; error: string }>;
  }> {
    const results: any[] = [];
    const errors: Array<{ email: string; error: string }> = [];

    for (const email of emails) {
      try {
        const result = await this.sendProjectInvitation(
          email,
          projectId,
          projectRoleId,
          invitedBy
        );
        results.push({ email, ...result });
      } catch (error: any) {
        errors.push({ email, error: error.message || "Unknown error" });
      }
    }

    return {
      success: results,
      errors,
    };
  }

  async getContributorsByProjectId(projectId: string): Promise<any[]> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return [];

    const contributors = await ProjectContributor.find({ projectId })
      .select("-projectId")
      .populate([
        { path: "userId", select: "fullName email avatar status" },
        { path: "projectRoleId", select: "name" },
      ])
      .lean();

    return contributors;
  }

  // Lấy contributor theo id (nếu cần dùng riêng)
  async getContributorById(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    return ProjectContributor.findById(id)
      .populate([
        { path: "userId", select: "fullName email avatar" },
        { path: "projectRoleId", select: "name" },
      ])
      .lean();
  }

  // Cập nhật contributor (ví dụ đổi role)
  async updateContributor(
    id: string,
    updateData: Partial<IProjectContributor>
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const updated = await ProjectContributor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "userId", select: "fullName email avatar" },
      { path: "projectRoleId", select: "name" },
    ]);

    return updated?.toObject() || null;
  }

  // Xóa contributor khỏi project
  async removeContributor(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;

    const deleted = await ProjectContributor.findByIdAndDelete(id);
    return !!deleted;
  }

  // Xoá theo userId và projectId nếu cần
  async removeContributorByUserAndProject(
    userId: string,
    projectId: string
  ): Promise<boolean> {
    const result = await ProjectContributor.findOneAndDelete({
      userId,
      projectId,
    });
    return !!result;
  }

  async getProjectsByUserId(userId: string): Promise<any[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];

    // Lấy projects mà user là contributor
    const contributors = await ProjectContributor.find({ userId })
      .populate({
        path: "projectId",
        select: "name icon projectType projectLead",
        populate: {
          path: "projectLead",
          select: "fullName email avatar",
        },
      })
      .select("projectId")
      .lean();

    // Lấy projects mà user là project lead
    const projectLeadProjects = await Project.find({
      projectLead: userId,
      deletedAt: null,
    })
      .select("name icon projectType projectLead")
      .populate({
        path: "projectLead",
        select: "fullName email avatar",
      })
      .lean();

    // Lấy projects mà user là creator
    const createdProjects = await Project.find({
      createdBy: userId,
      deletedAt: null,
    })
      .select("name icon projectType projectLead")
      .populate({
        path: "projectLead",
        select: "fullName email avatar",
      })
      .lean();

    // Kết hợp tất cả projects và loại bỏ duplicates
    const allProjects = [
      ...contributors
        .map((c) => c.projectId)
        .filter((project) => project != null),
      ...projectLeadProjects,
      ...createdProjects,
    ];

    // Loại bỏ duplicates dựa trên _id
    const uniqueProjects = allProjects.filter(
      (project, index, self) =>
        index ===
        self.findIndex((p) => p._id.toString() === project._id.toString())
    );

    return uniqueProjects;
  }

  // async getRoleContributorByProjectId(
  //   user: IUser,
  //   projectId: string
  // ): Promise<IProjectRole> {
  //   const projectContributor = await ProjectContributor.find({
  //     userId: user._id,
  //     projectId: projectId,
  //   });}

  async getRoleContributorByProjectId(
    user: IUser,
    projectId: string
  ): Promise<IProjectRole> {
    const projectContributor = await ProjectContributor.find({
      userId: user._id,
      projectId: projectId,
    });

    const projectRole = projectContributor.map((t) => t.projectRoleId);

    const role = await ProjectRole.findById(projectRole).select("name");

    if (!role) throw new Error("can not find role");
    return role;
  }

  // Lấy thống kê tổng quan về project
  async getProjectStatistics(projectId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("ProjectId không hợp lệ");
    }

    // Kiểm tra project có tồn tại không
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Dự án không tồn tại");
    }

    // Tìm role PROJECT_ADMIN
    const adminRole = await ProjectRole.findOne({ name: "PROJECT_ADMIN" });
    if (!adminRole) {
      throw new Error("Không tìm thấy role PROJECT_ADMIN");
    }

    // Lấy tất cả contributors trong project
    const allContributors = await ProjectContributor.find({ projectId })
      .populate({
        path: "userId",
        select: "status lastLogin",
      })
      .lean();

    // Tính toán thống kê
    const totalUsers = allContributors.length;

    // Số quản trị viên
    const adminCount = allContributors.filter(
      (contributor) =>
        contributor.projectRoleId.toString() ===
        (adminRole._id as mongoose.Types.ObjectId).toString()
    ).length;

    // Số người dùng đang hoạt động (có lastLogin trong 30 ngày gần đây)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = allContributors.filter((contributor) => {
      const user = contributor.userId as any;
      return (
        user &&
        user.status === "ACTIVE" &&
        user.lastLogin &&
        new Date(user.lastLogin) > thirtyDaysAgo
      );
    }).length;

    return {
      totalUsers,
      adminCount,
      activeUsers,
      projectName: project.name,
    };
  }

  async updateProjectLead(
    projectId: string,
    currentLeadId: string,
    newLeadId: string
  ): Promise<any> {
    if (
      !mongoose.Types.ObjectId.isValid(projectId) ||
      !mongoose.Types.ObjectId.isValid(currentLeadId) ||
      !mongoose.Types.ObjectId.isValid(newLeadId)
    ) {
      throw new Error("Invalid IDs provided");
    }

    const adminRole = await ProjectRole.findOne({ name: "PROJECT_ADMIN" });
    const contributorRole = await ProjectRole.findOne({ name: "CONTRIBUTOR" });
    if (!adminRole || !contributorRole) {
      throw new Error("Roles not found");
    }

    const currentLead = await ProjectContributor.findOne({
      userId: currentLeadId,
      projectId,
    });
    if (
      !currentLead ||
      currentLead.projectRoleId.toString() !== adminRole?._id?.toString()
    ) {
      throw new Error("Current lead is not PROJECT_ADMIN");
    }

    const newLead = await ProjectContributor.findOne({
      userId: newLeadId,
      projectId,
    });
    if (!newLead) {
      throw new Error("New lead is not a contributor of this project");
    }

    currentLead.projectRoleId = contributorRole._id as any;
    await currentLead.save();

    newLead.projectRoleId = adminRole._id as any;
    await newLead.save();

    await Project.findByIdAndUpdate(projectId, { projectLead: newLeadId });

    return { message: "Project lead updated successfully" };
  }

  async getContributorByUser(
    user: IUser,
    projectId: string
  ): Promise<IProjectContributor> {
    const contributor = await ProjectContributor.findOne({
      userId: user._id,
      projectId: projectId,
    });
    if (!contributor) {
      throw new Error("can not find project contributor");
    }

    return contributor;
  }
}

export default new ProjectContributorService();
