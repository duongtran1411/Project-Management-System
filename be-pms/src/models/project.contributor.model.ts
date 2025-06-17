import mongoose, { Document, Schema } from "mongoose";

export interface IProjectContributor extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  joinedAt?: Date;
}

const projectContributorSchema = new Schema<IProjectContributor>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  joinedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProjectContributor>(
  "ProjectContributor",
  projectContributorSchema
);
