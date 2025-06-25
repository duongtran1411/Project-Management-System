import Project, { IProject } from "../models/project.model";

export class ProjectService {
  async createProject(data: Partial<IProject>, user: any): Promise<IProject> {
    const project = await Project.create({
      ...data,
      createdBy: user._id,
      updatedBy: user._id,
    });
    return project.populate([
      { path: "projectLead", select: "fullName email" },
      { path: "defaultAssign", select: "fullName email" },
      { path: "workspaceId", select: "name" },
      { path: "contributors", select: "userId role" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);
  }

  async getAllProjects(): Promise<IProject[]> {
    return Project.find()
      .populate([
        { path: "projectLead", select: "fullName email" },
        { path: "defaultAssign", select: "fullName email" },
        { path: "workspaceId", select: "name" },
        { path: "contributors", select: "userId role" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
      ])
      .sort({ createdAt: -1 });
  }

  async getProjectById(projectId: string): Promise<IProject | null> {
    return Project.findById(projectId).populate([
      { path: "projectLead", select: "fullName email" },
      { path: "defaultAssign", select: "fullName email" },
      { path: "workspaceId", select: "name" },
      { path: "contributors", select: "userId role" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);
  }

  async updateProject(
    projectId: string,
    updateData: Partial<IProject>,
    user: any
  ): Promise<IProject | null> {
    return Project.findByIdAndUpdate(
      projectId,
      { ...updateData, updatedBy: user._id },
      { new: true, runValidators: true }
    ).populate([
      { path: "projectLead", select: "fullName email" },
      { path: "defaultAssign", select: "fullName email" },
      { path: "workspaceId", select: "name" },
      { path: "contributors", select: "userId role" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);
  }

  async deleteProject(projectId: string): Promise<boolean> {
    const result = await Project.findByIdAndDelete(projectId);
    return !!result;
  }
}

export default new ProjectService();
