import Feedback, { IFeedback } from "../models/feedback.model";
import ProjectContributor from "../models/project.contributor.model";
import User from "../models/user.model";
import mongoose from "mongoose";

export class FeedbackService {
  // Tạo feedback
  async createFeedback(data: Partial<IFeedback>): Promise<IFeedback> {
    if (!data.projectContributorId) {
      throw new Error("Thiếu projectContributorId");
    }

    const contributor = await ProjectContributor.findById(
      data.projectContributorId
    );
    if (!contributor) {
      throw new Error("Không tìm thấy projectContributor");
    }

    const user = await User.findById(contributor.userId);

    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    const feedback = await Feedback.create({
      projectContributorId: data.projectContributorId,
      projectId: contributor.projectId,
      userId: contributor.userId,
      email: user.email,
      message: data.message,
      type: data.type,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    });

    return feedback;
  }

  // Lấy danh sách feedback
  async getFeedbacks(
    page = 1,
    limit = 10,
    projectId:string
  ): Promise<{ data: IFeedback[]; total: number }> {
    const skip = (page - 1) * limit;

    const [feedbacks, total] = await Promise.all([
      Feedback.find({projectId: projectId})
        .populate("createdBy", "fullName email avatar")
        .populate("updatedBy", "fullName email avatar")
        .populate({
          path: "projectContributorId",
          select: "-projectId",
          populate: [
            { path: "userId", select: "fullName email" },
            { path: "projectRoleId", select: "name" },
          ],
        })
        .populate("projectId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Feedback.countDocuments({}),
    ]);

    return { data: feedbacks, total };
  }

  // Cập nhật feedback
  async updateFeedback(
    id: string,
    updateData: Partial<IFeedback>
  ): Promise<IFeedback | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid feedback ID");
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedBy: updateData.updatedBy,
      },
      { new: true }
    )
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email")
      .populate({
        path: "projectContributorId",
        select: "-projectId",
        populate: [
          { path: "userId", select: "fullName email" },
          { path: "projectRoleId", select: "name" },
        ],
      })
      .populate("projectId", "name")
      .lean();

    return updatedFeedback;
  }
}

export default new FeedbackService();
