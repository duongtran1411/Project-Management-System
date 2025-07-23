import mongoose from "mongoose";
import ProjectContributor from "../models/project.contributor.model";
import Project, { IProject } from "../models/project.model";
import ProjectRole from "../models/project.role.model";
import WorkspaceService from "./workspace.service";
import Task from "../models/task.model";
import Milestone from "../models/milestone.model";
import Comment from "../models/comment.model";
import Worklog from "../models/worklog.model";
import Epic from "../models/epic.model";

export class ProjectService {
  async createProject(
    data: { name: string; description?: string },
    user: any
  ): Promise<any> {
    // Kiểm tra tên project đã tồn tại chưa
    const duplicate = await Project.exists({
      name: data.name,
      deletedAt: null,
    });
    if (duplicate) {
      throw new Error("Một project với tên này đã tồn tại");
    }

    const project = await Project.create({
      name: data.name,
      description: data.description || "",
      projectType: "SOFTWARE",
      projectLead: user._id,
      defaultAssign: user._id,
      createdBy: user._id,
      updatedBy: user._id,
    });

    const populatedProject = await project.populate([
      { path: "projectLead", select: "fullName email" },
      { path: "defaultAssign", select: "fullName email" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);

    // Tự động thêm project vào workspace của người dùng
    try {
      const userWorkspace = await WorkspaceService.getWorkspaceByUser(user);
      if (userWorkspace) {
        await WorkspaceService.addProjectToWorkspace(
          (userWorkspace._id as mongoose.Types.ObjectId).toString(),
          (project._id as mongoose.Types.ObjectId).toString(),
          user
        );
      }
    } catch (error) {
      console.error("Failed to add project to user workspace:", error);
      // Không throw error vì project đã được tạo thành công
    }

    const projectAdminRole = await ProjectRole.findOne({
      name: "PROJECT_ADMIN",
    });
    if (!projectAdminRole) {
      throw new Error(
        "ROLE_PROJECT_ADMIN không tồn tại. Vui lòng kiểm tra lại các role của project."
      );
    }

    await ProjectContributor.create({
      userId: user._id,
      projectId: project._id,
      projectRoleId: projectAdminRole._id,
      joinedAt: new Date(),
    });

    return populatedProject.toObject();
  }

  async getAllProjects(): Promise<any[]> {
    const projects = await Project.find({ deletedAt: null })
      .populate([
        { path: "projectLead", select: "fullName email" },
        { path: "defaultAssign", select: "fullName email" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
      ])
      .sort({ createdAt: -1 })
      .lean();

    return projects;
  }

  async getProjectById(projectId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return null;

    const project = await Project.findOne({
      _id: projectId,
      deletedAt: null,
    }).populate([
      { path: "projectLead", select: "fullName email" },
      { path: "defaultAssign", select: "fullName email" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);

    return project?.toObject() || null;
  }

  async updateProject(
    projectId: string,
    updateData: Partial<IProject>,
    user: any
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return null;

    const updated = await Project.findByIdAndUpdate(
      projectId,
      { ...updateData, updatedBy: user._id },
      { new: true, runValidators: true }
    ).populate([
      { path: "projectLead", select: "fullName email" },
      { path: "defaultAssign", select: "fullName email" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);

    return updated?.toObject() || null;
  }

  async deleteProject(projectId: string, user: any): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return false;

    const project = await Project.findById(projectId);
    if (!project) return false;

    const isProjectLead =
      project.projectLead?.toString() === user._id.toString();

    if (!isProjectLead) {
      // Kiểm tra xem user có role PROJECT_ADMIN không
      const contributor = await ProjectContributor.findOne({
        userId: user._id,
        projectId: projectId,
      }).populate("projectRoleId");

      if (
        !contributor ||
        (contributor.projectRoleId as any).name !== "PROJECT_ADMIN"
      ) {
        throw new Error(
          "Bạn không có quyền xóa project này. Chỉ project admin mới có quyền xóa."
        );
      }
    }

    await Project.findByIdAndUpdate(projectId, { deletedAt: new Date() });
    return true;
  }

  async cleanupDeletedProjects(): Promise<void> {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const projectsToDelete = await Project.find({
      deletedAt: { $ne: null, $lte: new Date(now.getTime() - THIRTY_DAYS) },
    });
    for (const project of projectsToDelete) {
      const projectId = project._id;
      await ProjectContributor.deleteMany({ projectId });
      await Task.deleteMany({ projectId });
      await Milestone.deleteMany({ projectId });
      await Comment.deleteMany({ projectId });
      await Worklog.deleteMany({ projectId });
      await Epic.deleteMany({ projectId });
      await Project.findByIdAndDelete(projectId);
    }
  }

  async restoreProject(projectId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return null;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project không tồn tại");
    }

    if (!project.deletedAt) {
      throw new Error("Project chưa bị xoá mềm");
    }

    const restored = await Project.findByIdAndUpdate(
      projectId,
      { deletedAt: null },
      { new: true, runValidators: true }
    ).populate([
      { path: "projectLead", select: "fullName email" },
      { path: "defaultAssign", select: "fullName email" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);

    return restored?.toObject() || null;
  }

  async getDeletedProjects(): Promise<any[]> {
    const projects = await Project.find({ deletedAt: { $ne: null } })
      .populate([
        { path: "projectLead", select: "fullName email" },
        { path: "defaultAssign", select: "fullName email" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
      ])
      .sort({ deletedAt: -1 })
      .lean();

    return projects;
  }
}

export default new ProjectService();
