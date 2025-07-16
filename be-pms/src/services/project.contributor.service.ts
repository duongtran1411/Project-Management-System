import ProjectContributor, {
  IProjectContributor,
  ProjectInvitation,
  IProjectInvitation,
} from "../models/project.contributor.model";
import User from "../models/user.model";
import Project from "../models/project.model";
import ProjectRole from "../models/project.role.model";
import mongoose from "mongoose";
import { sendProjectInvitationEmail } from "../utils/email.util";
import crypto from "crypto";
import NotificationService from "./notification.service";

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
    const confirmUrl = `http://localhost:3000/create-project/invite-page/confirm-invite/${token}`;

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

    // Tạo contributor
    const contributor = await ProjectContributor.create({
      userId: user._id,
      projectId: invitation.projectId,
      projectRoleId: invitation.projectRoleId,
    });

    // Cập nhật status invitation
    await ProjectInvitation.findByIdAndUpdate(invitation._id, {
      status: "accepted",
    });

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
        { path: "userId", select: "fullName email avatar" },
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

    const contributors = await ProjectContributor.find({ userId })
      .populate({
        path: "projectId",
        select: "name icon projectType projectLead",
        populate: {
          path: "projectLead",
          select: "fullName email",
        },
      })
      .select("projectId")
      .lean();

    return contributors
      .map((c) => c.projectId)
      .filter((project) => project != null); // đảm bảo loại bỏ project null nếu contributor lỗi
  }
}

export default new ProjectContributorService();
