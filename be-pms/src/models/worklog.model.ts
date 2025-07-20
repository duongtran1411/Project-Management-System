import mongoose, { Document, Schema } from "mongoose";

export interface IWorklog extends Document {
  contributor?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  description: string;
  timeSpent: number;
  timeRemain: number;
  startDate: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const worklogSchema = new Schema<IWorklog>(
  {
    contributor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    timeSpent: {
      type: Number,
      required: [true, "Timespent is required"],
    },
    timeRemain: {
      type: Number,
    },
    startDate: {
      type: Date,
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

export default mongoose.model<IWorklog>("Worklog", worklogSchema);
