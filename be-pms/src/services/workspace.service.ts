import Workspace, { IWorkspace } from "../models/workspace.model";
import mongoose from "mongoose";

class WorkspaceService {
  async createWorkspace(data: Partial<IWorkspace>, user: any): Promise<any> {
    const workspace = await Workspace.create({
      ...data,
      ownerId: user._id,
      createdBy: user._id,
      updatedBy: user._id,
    });

    return workspace.populate([
      { path: "ownerId", select: "fullName email" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectIds", select: "name" },
    ]);
  }

  async getAllWorkspaces(): Promise<any[]> {
    const workspaces = await Workspace.find()
      .populate([
        { path: "ownerId", select: "fullName email" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "projectIds", select: "name" },
      ])
      .sort({ createdAt: -1 })
      .lean();
    return workspaces;
  }

  async getWorkspaceById(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    return Workspace.findById(id)
      .populate([
        { path: "ownerId", select: "fullName email" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "projectIds", select: "name" },
      ])
      .lean();
  }

  async updateWorkspace(
    id: string,
    updateData: Partial<IWorkspace>,
    user: any
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const updated = await Workspace.findByIdAndUpdate(
      id,
      { ...updateData, updatedBy: user._id },
      { new: true, runValidators: true }
    ).populate([
      { path: "ownerId", select: "fullName email" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectIds", select: "name" },
    ]);

    return updated?.toObject() || null;
  }

  async deleteWorkspace(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const deleted = await Workspace.findByIdAndDelete(id);
    return !!deleted;
  }
}

export default new WorkspaceService();
