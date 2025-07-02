import ProjectContributor, {
  IProjectContributor,
} from "../models/project.contributor.model";
import mongoose from "mongoose";

export class ProjectContributorService {
  // Thêm một contributor vào project
  async addContributor(data: Partial<IProjectContributor>): Promise<any> {
    const exists = await ProjectContributor.findOne({
      userId: data.userId,
      projectId: data.projectId,
    });

    if (exists)
      throw new Error("User is already a contributor to this project.");

    const contributor = await ProjectContributor.create(data);

    return contributor.populate([
      { path: "userId", select: "fullName email avatar" },
      { path: "roleId", select: "name" },
    ]);
  }

  // Lấy tất cả contributors theo projectId
  async getContributorsByProjectId(projectId: string): Promise<any[]> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return [];

    const contributors = await ProjectContributor.find({ projectId })
      .populate([
        { path: "userId", select: "fullName email avatar" },
        { path: "roleId", select: "name" },
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
        { path: "roleId", select: "name" },
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
      { path: "roleId", select: "name" },
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
}

export default new ProjectContributorService();
