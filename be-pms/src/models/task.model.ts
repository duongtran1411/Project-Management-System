import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
  name: string;
  description: string;
  epic?: mongoose.Types.ObjectId;
  milestones?: mongoose.Types.ObjectId;
  assignee?: mongoose.Types.ObjectId;
  startDate?: Date;
  dueDate?: Date;
  reporter?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  priority: string;
  labels: string[];
}

const taskSchema = new Schema<ITask>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    labels: [String],
    epic: {
      type: Schema.Types.ObjectId,
      ref: "Epic",
      required: [false, "task can not have epic"],
    },
    milestones: {
      type: Schema.Types.ObjectId,
      ref: "Milestone",
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    status: {
      type: String,
      enum: ["TO_DO", "IN_PROGRESS", "DONE"],
      default: "TO_DO",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
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

export default mongoose.model<ITask>("Task", taskSchema);
