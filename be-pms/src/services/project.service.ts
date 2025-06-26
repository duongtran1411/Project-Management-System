import Project, { IProject } from "../models/project.model";
import mongoose from "mongoose";

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

  async addMember(
    projectId: string,
    contributorIds: string[],
    user: any
  ): Promise<IProject | null> {
    const validContributorIds = contributorIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $addToSet: {
          contributors: { $each: validContributorIds },
        },
        updatedBy: user._id,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "projectLead", select: "fullName email" },
      { path: "defaultAssign", select: "fullName email" },
      { path: "workspaceId", select: "name" },
      { path: "contributors", select: "userId role" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
    ]);

    return project;
  }
}

export default new ProjectService();
