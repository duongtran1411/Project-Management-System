import mongoose, { Document, Schema } from "mongoose";

export interface IPermission extends Document {
  code: string;
  description?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    code: {
      type: String,
      required: [true, "code is required"],
    },
    description:{
      type:String,
      required:[true, "description is required"]
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

export default mongoose.model<IPermission>("Permission", permissionSchema);
