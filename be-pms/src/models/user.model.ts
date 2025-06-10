import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  phone?: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  failedLoginAttempts: number;
  verified: boolean;
  roles?: mongoose.Types.ObjectId[];
  workspaces?: mongoose.Types.ObjectId[];
  lastLogin?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Virtual property for backward compatibility
  isActive: boolean;
  // Method for password comparison
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Fullname is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
            v
          );
        },
        message: (props: any) => `${props.value} is not a valid email`,
      },
    },
    password: {
      type: String,
      minLength: [8, "Password must have at least 8 characters"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    avatar: String,
    phone: {
      type: String,
      match: [
        /^(?:\+84|0)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/,
        "Invalid phone number",
      ],
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "INACTIVE", "DELETED"],
        message: "Status must be 'ACTIVE', 'INACTIVE', or 'DELETED'.",
      },
      default: "ACTIVE",
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    workspaces: [
      {
        type: Schema.Types.ObjectId,
        ref: "Workspace",
      },
    ],
    lastLogin: {
      type: Date,
      default: null,
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

// Virtual property for backward compatibility
userSchema.virtual("isActive").get(function () {
  return this.status === "ACTIVE";
});

// Hash password middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const bcrypt = require("bcryptjs");
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
