import ProjectContributor, {
  IProjectContributor,
} from "../models/project.contributor.model";
import User from "../models/user.model";
import mongoose from "mongoose";

export class ProjectContributorService {
  async addContributorByEmail(
    email: string,
    projectId: string,
    projectRoleId: string
  ): Promise<any> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`Email ${email} không tồn tại trong hệ thống.`);
    }

    const exists = await ProjectContributor.findOne({
      userId: user._id,
      projectId,
    });

    if (exists) {
      throw new Error(`Người dùng ${email} đã là contributor của dự án này.`);
    }

    const contributor = await ProjectContributor.create({
      userId: user._id,
      projectId,
      projectRoleId,
    });

    return contributor.populate([
      { path: "userId", select: "fullName email avatar" },
      { path: "projectRoleId", select: "name" },
    ]);
  }

  async addMultipleContributors(
    emails: string[],
    projectId: string,
    projectRoleId: string
  ): Promise<{
    success: any[];
    errors: Array<{ email: string; error: string }>;
  }> {
    const results: any[] = [];
    const errors: Array<{ email: string; error: string }> = [];

    const existingUsers = await User.find({ email: { $in: emails } });
    const existingEmails = existingUsers.map((user) => user.email);
    const nonExistingEmails = emails.filter(
      (email) => !existingEmails.includes(email)
    );

    nonExistingEmails.forEach((email) => {
      errors.push({
        email,
        error: `Email ${email} không tồn tại trong hệ thống.`,
      });
    });

    for (const email of existingEmails) {
      try {
        const result = await this.addContributorByEmail(
          email,
          projectId,
          projectRoleId
        );
        results.push(result);
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
      })
      .select("projectId") // Chỉ cần trường projectId
      .lean();

    return contributors.map((c) => c.projectId);
  }
}

export default new ProjectContributorService();
