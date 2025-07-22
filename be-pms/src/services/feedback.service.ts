import Feedback, { IFeedback } from "../models/feedback.model";
import mongoose from "mongoose";

export class FeedbackService {
  // Tạo feedback
  async createFeedback(data: Partial<IFeedback>): Promise<IFeedback> {
    const createdFeedback = await Feedback.create(data);
    return createdFeedback;
  }

  // Lấy danh sách feedback (có phân trang & lọc nếu muốn mở rộng)
  async getFeedbacks(
    filter: any = {},
    page = 1,
    limit = 10
  ): Promise<{ data: IFeedback[]; total: number }> {
    const skip = (page - 1) * limit;
    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .populate("userId", "fullName email")
        .populate("projectContributorId", "userId projectId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Feedback.countDocuments(filter),
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

    const updatedFeedback = await Feedback.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("userId", "fullName email")
      .populate("projectContributorId", "userId projectId")
      .lean();

    return updatedFeedback;
  }
}

export default new FeedbackService();
