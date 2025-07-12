import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
  permissionIds?: mongoose.Types.ObjectId[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    description: {
      type: String,
      required: false,
    },
    permissionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
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

export default mongoose.model<IRole>("Role", roleSchema);
