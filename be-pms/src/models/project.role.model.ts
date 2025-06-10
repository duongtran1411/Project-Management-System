import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProjectRole extends Document {
  name: string;
  projectpermissionIds?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const projectRoleSchema = new Schema<IProjectRole>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    projectpermissionIds:[{
      type: Schema.Types.ObjectId,
      ref:"ProjectPermission"
    }]
  },
  { timestamps: true }
);

export default mongoose.model<IProjectRole>("ProjectRole", projectRoleSchema);
