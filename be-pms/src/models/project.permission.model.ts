import mongoose, { Document, Schema } from "mongoose";

export interface IProjectPermission extends Document {
  name: string;
  description?: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectPermissionSchema = new Schema<IProjectPermission>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    description: {
      type: String,
    },
    code: {
      type: String,
      required: [true, "code is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProjectPermission>(
  "ProjectPermission",
  projectPermissionSchema
);
