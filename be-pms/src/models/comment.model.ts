import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  content: string;
  task: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  mentions?: mongoose.Types.ObjectId[];
  attachments?: {
    filename: string;
    url: string;
  }[];
  editedAt?: Date;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task reference is required"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: [
      {
        filename: String,
        url: String,
      },
    ],
    editedAt: {
      type: Date,
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Update editedAt when content changes
commentSchema.pre("save", function (next) {
  if (this.isModified("content") && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

export default mongoose.model<IComment>("Comment", commentSchema);
