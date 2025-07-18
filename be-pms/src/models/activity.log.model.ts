import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLog extends Document {
  action: string;
  entity: string;
  entityId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  ipAddress: string;
  userAgent?: string;
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
  timezone?: string;
  details: any;
  status: "SUCCESS" | "FAILED" | "WARNING";
  errorMessage?: string;
  sessionId?: string;
  requestMethod?: string;
  requestUrl?: string;
  responseTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: [
        // Authentication actions
        "LOGIN",
        "LOGOUT",
        "REGISTER",
        "PASSWORD_RESET",
        "FORGOT_PASSWORD_REQUEST",
        "LOGIN_FAILED",
        // User actions
        "USER_CREATE",
        "USER_UPDATE",
        "USER_DELETE",
        "USER_STATUS_CHANGE",
        // Project actions
        "PROJECT_CREATE",
        "PROJECT_UPDATE",
        "PROJECT_DELETE",
        "PROJECT_STATUS_CHANGE",
        // Task actions
        "TASK_CREATE",
        "TASK_UPDATE",
        "TASK_DELETE",
        "TASK_STATUS_CHANGE",
        "TASK_ASSIGN",
        // Workspace actions
        "WORKSPACE_CREATE",
        "WORKSPACE_UPDATE",
        "WORKSPACE_DELETE",
        // Epic actions
        "EPIC_CREATE",
        "EPIC_UPDATE",
        "EPIC_DELETE",
        // Milestone actions
        "MILESTONE_CREATE",
        "MILESTONE_UPDATE",
        "MILESTONE_DELETE",
        // Email actions
        "EMAIL_SENT",
        "EMAIL_TEMPLATE_CREATE",
        "EMAIL_TEMPLATE_UPDATE",
        // System actions
        "API_CALL",
        "ERROR",
        "PERMISSION_DENIED",
        "RATE_LIMIT_EXCEEDED",
      ],
    },
    entity: {
      type: String,
      required: [true, "Entity is required"],
      enum: [
        "User",
        "Project",
        "Task",
        "Workspace",
        "Epic",
        "Milestone",
        "Email",
        "System",
      ],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: "entity",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ipAddress: {
      type: String,
      required: [true, "IP address is required"],
      validate: {
        validator: function (v: string) {
          // Accept unknown IP
          if (v === "unknown") return true;
          // Accept localhost IPv4/IPv6
          if (v === "::1" || v === "127.0.0.1" || v === "0.0.0.0" || v === "::")
            return true;
          // Basic IP validation (IPv4 and IPv6)
          const ipv4Regex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          const ipv6Regex =
            /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
          // IPv4-mapped IPv6 addresses
          const ipv4MappedRegex =
            /^::ffff:(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          return (
            ipv4Regex.test(v) || ipv6Regex.test(v) || ipv4MappedRegex.test(v)
          );
        },
        message: "Invalid IP address format",
      },
    },
    userAgent: {
      type: String,
      maxlength: 500,
    },
    country: String,
    city: String,
    region: String,
    latitude: Number,
    longitude: Number,
    isp: String,
    timezone: String,
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "WARNING"],
      default: "SUCCESS",
    },
    errorMessage: String,
    sessionId: String,
    requestMethod: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },
    requestUrl: String,
    responseTime: Number, // in milliseconds
  },
  { timestamps: true }
);

// Create indexes
activityLogSchema.index({ ipAddress: 1 });
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ entity: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ status: 1 });
activityLogSchema.index({ country: 1 });
activityLogSchema.index({ city: 1 });

export default mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
