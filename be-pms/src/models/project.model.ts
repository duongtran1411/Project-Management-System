import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  name: string;
  icon?: string;
  projectType?: "SOFTWARE" | "MARKETING" | "SALES";
  projectLead?: mongoose.Types.ObjectId;
  defaultAssign?: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  contributors?: mongoose.Types.ObjectId[];
  status: "TODO" | "INPROGRESS" | "COMPLETE";
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    icon: {
      type: String,
      default: "sonditrongmua",
    },
    projectType: {
      type: String,
      enum: {
        values: ["SOFTWARE", "MARKETING", "SALES"],
        message: "ProjectType must be 'SOFTWARE', 'MARKETING', or 'SALES'.",
      },
    },
    projectLead: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    defaultAssign: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
    },
    description: { type: String },
    contributors: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProjectContributor",
      },
    ],
    status: {
      type: String,
      enum: ["TODO", "INPROGRESS", "COMPLETE"],
      default: "TODO",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  },
  { timestamps: true }
);

export default mongoose.model<IProject>("Project", projectSchema);
