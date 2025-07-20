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

projectContributorSchema.index({ userId: 1, projectId: 1 }, { unique: true });

export default mongoose.model<IProjectContributor>(
  "ProjectContributor",
  projectContributorSchema
);

export interface IProjectInvitation extends Document {
  email: string;
  projectId: mongoose.Types.ObjectId;
  projectRoleId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  token: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: Date;
  createdAt: Date;
}

const projectInvitationSchema = new Schema<IProjectInvitation>({
  email: { type: String, required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  projectRoleId: {
    type: Schema.Types.ObjectId,
    ref: "ProjectRole",
    required: true,
  },
  invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "expired"],
    default: "pending",
  },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ProjectInvitation = mongoose.model<IProjectInvitation>(
  "ProjectInvitation",
  projectInvitationSchema
);
