import mongoose, { Document, Schema } from "mongoose";

export interface IProjectContributor extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  projectRoleId: mongoose.Types.ObjectId;
  joinedAt?: Date;
}

const projectContributorSchema = new Schema<IProjectContributor>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  projectRoleId: {
    type: Schema.Types.ObjectId,
    ref: "ProjectRole",
    required: true,
  },
  joinedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProjectContributor>(
  "ProjectContributor",
  projectContributorSchema
);
