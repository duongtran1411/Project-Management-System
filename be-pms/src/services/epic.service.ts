import Epic, { IEpic } from "../models/epic.model";
import { AuthRequest } from "../middlewares/auth.middleware";

export class EpicService {
  async createEpic(epicData: Partial<IEpic>, user: any): Promise<IEpic> {
    if (!epicData.projectId) {
      throw new Error("projectId là bắt buộc để tạo epic");
    }

    const epic = await Epic.create({
      ...epicData,
      createdBy: user._id,
      updatedBy: user._id,
    });
    return epic.populate([
      { path: "assignee", select: "fullName email avatar" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
      { path: "milestonesId", select: "name description" },
    ]);
  }

  async getAllEpics(projectId?: string, filters?: any): Promise<IEpic[]> {
    const query: any = {};

    if (projectId) {
      query.projectId = projectId;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.assignee) {
      query.assignee = filters.assignee;
    }

    const epics = await Epic.find(query)
      .populate([
        { path: "assignee", select: "fullName email avatar" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "projectId", select: "name description" },
        { path: "milestonesId", select: "name description" },
      ])
      .sort({ createdAt: -1 });

    return epics;
  }

  async getEpicById(epicId: string): Promise<IEpic | null> {
    const epic = await Epic.findById(epicId).populate([
      { path: "assignee", select: "fullName email avatar" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
      { path: "milestonesId", select: "name description" },
    ]);
    return epic;
  }

  async updateEpic(
    epicId: string,
    updateData: Partial<IEpic>,
    user: any
  ): Promise<IEpic | null> {
    if (updateData.projectId !== undefined && !updateData.projectId) {
      throw new Error("Project ID is required");
    }

    const epic = await Epic.findByIdAndUpdate(
      epicId,
      {
        ...updateData,
        updatedBy: user._id,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "assignee", select: "fullName email avatar" },
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
      { path: "milestonesId", select: "name description" },
    ]);

    return epic;
  }

  async deleteEpic(epicId: string): Promise<boolean> {
    const result = await Epic.findByIdAndDelete(epicId);
    return !!result;
  }

  async getEpicsByProject(projectId: string): Promise<IEpic[]> {
    const epics = await Epic.find({ projectId })
      .populate([
        { path: "assignee", select: "fullName email avatar" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "milestonesId", select: "name description" },
      ])
      .sort({ createdAt: -1 });

    return epics;
  }

  async getEpicsByAssignee(assigneeId: string): Promise<IEpic[]> {
    const epics = await Epic.find({ assignee: assigneeId })
      .populate([
        { path: "assignee", select: "fullName email avatar" },
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "projectId", select: "name description" },
        { path: "milestonesId", select: "name description" },
      ])
      .sort({ createdAt: -1 });

    return epics;
  }
}

export default new EpicService();
