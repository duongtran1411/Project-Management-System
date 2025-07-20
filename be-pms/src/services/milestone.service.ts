import Milestone, { IMilestone } from "../models/milestone.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import { IUser } from "../models";

export class MilestoneService {
  async createMilestone(
    milestoneData: Partial<IMilestone>,
    user: any
  ): Promise<IMilestone> {
    if (!milestoneData.projectId) {
      throw new Error("Project ID is required");
    }

    const milestone = await Milestone.create({
      ...milestoneData,
      status: 'NOT_START',
      createdBy: user._id,
      updatedBy: user._id,
    });
    return milestone.populate([
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
    ]);
  }

  async getAllMilestones(
    projectId?: string,
    filters?: any
  ): Promise<IMilestone[]> {
    const query: any = {};

    if (projectId) {
      query.projectId = projectId;
    }

    if (filters?.startDate) {
      query.startDate = { $gte: new Date(filters.startDate) };
    }

    if (filters?.endDate) {
      query.endDate = { $lte: new Date(filters.endDate) };
    }

    const milestones = await Milestone.find(query)
      .populate([
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "projectId", select: "name description" },
      ])
      .sort({ createdAt: -1 });

    return milestones;
  }

  async getMilestoneById(milestoneId: string): Promise<IMilestone | null> {
    const milestone = await Milestone.findById(milestoneId).populate([
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
    ]);
    return milestone;
  }

  async updateMilestone(
    milestoneId: string,
    updateData: Partial<IMilestone>,
    user: any
  ): Promise<IMilestone | null> {
    const milestone = await Milestone.findByIdAndUpdate(
      milestoneId,
      {
        ...updateData,
        updatedBy: user._id,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "createdBy", select: "fullName email" },
      { path: "updatedBy", select: "fullName email" },
      { path: "projectId", select: "name description" },
    ]);

    return milestone;
  }

  async deleteMilestone(milestoneId: string): Promise<boolean> {
    const result = await Milestone.findByIdAndDelete(milestoneId);
    return !!result;
  }

  async getMilestonesByProject(projectId: string): Promise<IMilestone[]> {
    const milestones = await Milestone.find({ projectId})
      .populate([
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
      ])
      .sort({ createdAt: -1 });

    return milestones;
  }

  async getMilestonesNotStart(projectId: string): Promise<IMilestone[]> {
    const milestones = await Milestone.find({ projectId, status: 'NOT_START' })
      .populate([
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
      ])
      .sort({ createdAt: -1 });

    return milestones;
  }

  async getMilestonesActive(projectId: string): Promise<IMilestone[]> {
    const milestones = await Milestone.find({ projectId, status: 'ACTIVE' })
      .populate([
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
      ])
      .sort({ createdAt: -1 });

    return milestones;
  }

  async getMilestonesByDateRange(
    startDate: Date,
    endDate: Date,
    projectId?: string
  ): Promise<IMilestone[]> {
    const query: any = {
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    };

    if (projectId) {
      query.projectId = projectId;
    }

    const milestones = await Milestone.find(query)
      .populate([
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "projectId", select: "name description" },
      ])
      .sort({ startDate: 1 });

    return milestones;
  }

  async getUpcomingMilestones(
    projectId?: string,
    limit: number = 10
  ): Promise<IMilestone[]> {
    const query: any = {
      endDate: { $gte: new Date() },
    };

    if (projectId) {
      query.projectId = projectId;
    }

    const milestones = await Milestone.find(query)
      .populate([
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "projectId", select: "name description" },
      ])
      .sort({ endDate: 1 })
      .limit(limit);

    return milestones;
  }

  async getOverdueMilestones(projectId?: string): Promise<IMilestone[]> {
    const query: any = {
      endDate: { $lt: new Date() },
    };

    if (projectId) {
      query.projectId = projectId;
    }

    const milestones = await Milestone.find(query)
      .populate([
        { path: "createdBy", select: "fullName email" },
        { path: "updatedBy", select: "fullName email" },
        { path: "projectId", select: "name description" },
      ])
      .sort({ endDate: 1 });

    return milestones;
  }

  async updateStatusMilestones(id: string, status: string, user: IUser): Promise<IMilestone> {
    const milestone = await Milestone.findByIdAndUpdate(
      id,
      {
        status: status,
        updatedBy: user._id
      }, {
      new: true
    })

    if (!milestone) {
      throw new Error(`Can not update or find id ${id}`)
    }

    return milestone
  }

  
}

export default new MilestoneService();
