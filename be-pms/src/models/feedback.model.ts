import mongoose, { Document, Schema } from "mongoose";

export interface IFeedback extends Document {
    userId: mongoose.Types.ObjectId;
    projectContributorId: mongoose.Types.ObjectId;
    message: string;
    type?: 'BUG' | 'FEATURE_REQUEST' | 'COMMENT';
    createdAt: Date;
    updatedAt: Date;
}

const FeedbackSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    projectContributorId: {
        type: Schema.Types.ObjectId,
        ref: 'ProjectContributor',
        required: false
    },
    email: { type: String, required: false },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['BUG', 'FEATURE_REQUEST', 'COMMENT'],
        default: 'COMMENT'
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

export default mongoose.model<IFeedback>("Feedback", FeedbackSchema);
