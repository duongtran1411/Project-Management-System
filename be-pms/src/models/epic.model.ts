import mongoose, { Document, Schema } from "mongoose";

export interface IEpic extends Document {
  name: string;
  description: string;
  projectId: mongoose.Types.ObjectId;
  milestonesId: mongoose.Types.ObjectId;
  assignee: mongoose.Types.ObjectId;
  status: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const epicSchema = new Schema<IEpic>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "projectId is required"],
    },
    milestonesId: {
      type: Schema.Types.ObjectId,
      ref: "Milestone",
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["TO_DO", "IN_PROGRESS", "DONE"],
      default: "TO_DO",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEpic>("Epic", epicSchema);
