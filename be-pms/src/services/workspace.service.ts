import { IUser } from "../models";
import Workspace, { IWorkspace } from "../models/workspace.model";
import mongoose from "mongoose";

class WorkspaceService {
  async createWorkspace(data: Partial<IWorkspace>, user: any): Promise<any> {
    const workspace = await Workspace.create({
      ...data,
      ownerId: user._id,
      createdBy: user._id,
      updatedBy: user._id,
      projectIds: data.projectIds || [],
    });

    return workspace.populate([
      { path: "ownerId", select: "fullName email" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectIds", select: "name" },
    ]);
  }

  async addProjectToWorkspace(
    workspaceId: string,
    projectId: string,
    user: any
  ): Promise<any> {
    if (
      !mongoose.Types.ObjectId.isValid(workspaceId) ||
      !mongoose.Types.ObjectId.isValid(projectId)
    ) {
      throw new Error("Workspace ID hoặc Project ID không hợp lệ");
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace không tồn tại");
    }

    // Kiểm tra xem project đã có trong workspace chưa
    if (workspace.projectIds?.toString().includes(projectId)) {
      throw new Error("Project đã tồn tại trong workspace này");
    }

    // Thêm project vào workspace
    workspace.projectIds?.push(
      new mongoose.Types.ObjectId(projectId.toString())
    );
    workspace.updatedBy = user._id;
    await workspace.save();

    return workspace.populate([
      { path: "ownerId", select: "fullName email" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectIds", select: "name" },
    ]);
  }

  async removeProjectFromWorkspace(
    workspaceId: string,
    projectId: string,
    user: any
  ): Promise<any> {
    if (
      !mongoose.Types.ObjectId.isValid(workspaceId) ||
      !mongoose.Types.ObjectId.isValid(projectId)
    ) {
      throw new Error("Workspace ID hoặc Project ID không hợp lệ");
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace không tồn tại");
    }

    // Xóa project khỏi workspace
    workspace.projectIds = workspace.projectIds?.filter(
      (id) => id.toString() !== projectId
    );

    workspace.updatedBy = user._id;
    await workspace.save();

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

  async getWorkspaceByUser(user: IUser): Promise<IWorkspace> {
    const id = user._id
    if (!id) {
      console.error("Không tìm thấy ID của user");
      throw new Error("Invalid user ID");
    }

    console.log("ID:", id);
    console.log('id', id);
    const workspace = await Workspace.findOne({ ownerId: id })

    if (!workspace) {
      throw new Error(`Can not find workspace of user id : ${user._id}`)
    }
    return workspace
  }
}

export default new WorkspaceService();
