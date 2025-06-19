import mongoose, { Document, Schema } from "mongoose";

export interface IEmailTemplate extends Document {
    name: string; // key định danh (VD: "VERIFY_EMAIL", "RESET_PASSWORD")
    subject: string;
    header: string;
    body: string; // nội dung HTML
    footer: string;
    variables?: string[]; // danh sách biến cần thay thế
    status: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>({
    name: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    header: { type: String },  // optional
    body: { type: String, required: true },
    footer: { type: String },  // optional
    variables: [{ type: String }],
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "INACTIVE",
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User create feedback"]
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User create feedback"]
    }
}, { timestamps: true });

export default mongoose.model<IEmailTemplate>("EmailTemplate", EmailTemplateSchema)

