import mongoose, { Document, Schema } from "mongoose";

export interface IEmailVerification extends Document {
  email: string;
  token: string;
  otp?: string;
  attempts?: number;
  maxAttempts?: number;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emailVerificationSchema = new Schema<IEmailVerification>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    token: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    otp: {
      type: String,
      required: false, // Có thể có hoặc không
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index để tối ưu query
emailVerificationSchema.index({ email: 1, isUsed: 1 });
// Không cần index token vì đã có unique: true
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IEmailVerification>(
  "EmailVerification",
  emailVerificationSchema
);
