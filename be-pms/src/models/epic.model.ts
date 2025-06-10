import mongoose, { Document, Schema } from "mongoose";

export interface IEpic extends Document {
  name: string;
  description: string;
  assignee?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
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
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: "Milestone",
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
