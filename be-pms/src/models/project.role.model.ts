import mongoose, { Document, Schema } from "mongoose";

export interface IProjectRole extends Document {
  name: string;
  projectId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectRoleSchema = new Schema<IProjectRole>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProjectRole>("ProjectRole", projectRoleSchema);
