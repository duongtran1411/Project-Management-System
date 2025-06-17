import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProjectPermission extends Document {
  name: string;
  description?: string;
  code: string;
  createdBy: Types.ObjectId
  updatedBy: Types.ObjectId
  createdAt: Date;
  updatedAt: Date;
}

const projectPermissionSchema = new Schema<IProjectPermission>(
  {
    code: {
      type: String,
      required: [true, "code is required"],
    },
    description: {
      type: String,
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

export default mongoose.model<IProjectPermission>(
  "ProjectPermission",
  projectPermissionSchema
);
