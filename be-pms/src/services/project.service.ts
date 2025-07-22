import mongoose from "mongoose";
import ProjectContributor from "../models/project.contributor.model";
import Project, { IProject } from "../models/project.model";
import ProjectRole from "../models/project.role.model";
import Workspace from "../models/workspace.model";
import WorkspaceService from "./workspace.service";

export class ProjectService {
  async createProject(data: Partial<IProject>, user: any): Promise<any> {
    if (data.workspaceId) {
      const workspaceExists = await Workspace.exists({ _id: data.workspaceId });
      if (!workspaceExists) {
        throw new Error("Workspace not found");
      }
    }

    const nameQuery: any = { name: data.name };
    if (data.workspaceId) nameQuery.workspaceId = data.workspaceId;

    const duplicate = await Project.exists(nameQuery);
    if (duplicate) {
      throw new Error("Một project với tên này đã tồn tại trong workspace này");
    }

    const project = await Project.create({
      ...data,
      projectLead: user._id,
      defaultAssign: user._id,
      createdBy: user._id,
      updatedBy: user._id,
    });

    const populatedProject = await project.populate([
      { path: "projectLead", select: "fullName email" },
      { path: "defaultAssign", select: "fullName email" },
      { path: "workspaceId", select: "name" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);

    // Tự động thêm project vào workspace nếu có workspaceId
    if (data.workspaceId) {
      try {
        await WorkspaceService.addProjectToWorkspace(
          data.workspaceId.toString(),
          (project._id as any).toString(),
          user
        );
      } catch (error) {
        console.error("Failed to add project to workspace:", error);
        // Không throw error vì project đã được tạo thành công
      }
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
    const projects = await Project.find()
      .populate([
        { path: "projectLead", select: "fullName email" },
        { path: "defaultAssign", select: "fullName email" },
        { path: "workspaceId", select: "name" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
      ])
      .sort({ createdAt: -1 })
      .lean();

    return projects;
  }

  async getProjectById(projectId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return null;

    const project = await Project.findById(projectId).populate([
      { path: "projectLead", select: "fullName email" },
      { path: "defaultAssign", select: "fullName email" },
      { path: "workspaceId", select: "name" },
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
      { path: "workspaceId", select: "name" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);

    return updated?.toObject() || null;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return false;

    const project = await Project.findById(projectId);
    if (!project) return false;

    const deleted = await Project.findByIdAndDelete(projectId);
    if (!deleted) return false;

    // Xóa project khỏi workspace nếu có
    if (project.workspaceId) {
      try {
        await WorkspaceService.removeProjectFromWorkspace(
          project.workspaceId.toString(),
          projectId,
          { _id: project.updatedBy } // Sử dụng updatedBy của project
        );
      } catch (error) {
        console.error("Failed to remove project from workspace:", error);
      }
    }

    await ProjectContributor.deleteMany({ projectId });

    return true;
  }
}

export default new ProjectService();
