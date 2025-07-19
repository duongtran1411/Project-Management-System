import mongoose, { Document, Schema } from "mongoose";

export interface IMilestone extends Document {
  name: string;
  startDate?: Date;
  endDate?: Date;
  goal?: string;
  status:string;
  projectId?: mongoose.Types.ObjectId; 
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: Date.now,
    },
    goal: {
      type: String,
      required: false,
    },
    status:{
      type:String,
      enum: ["FUTURE", "COMPLETED", "ACTIVE"],
      default: "FUTURE",
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
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

export default mongoose.model<IMilestone>("Milestone", milestoneSchema);
