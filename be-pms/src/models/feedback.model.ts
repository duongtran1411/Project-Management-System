import mongoose, { Document, Schema } from "mongoose";

export interface IFeedback extends Document {
  projectContributorId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  email: string;
  message: string;
  type?: "BUG" | "FEATURE_REQUEST" | "COMMENT";
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    projectContributorId: {
      type: Schema.Types.ObjectId,
      ref: "ProjectContributor",
      required: false,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    email: { type: String, required: false },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["BUG", "FEATURE_REQUEST", "COMMENT"],
      default: "COMMENT",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User create feedback"],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User create feedback"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IFeedback>("Feedback", FeedbackSchema);
