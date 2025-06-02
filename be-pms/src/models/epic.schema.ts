import mongoose from "mongoose";
import User from "./users.schema";
import Project from "./projects.schema";
import Milestone from "./milestones.schema"
const EpicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"]
    },
    description: {
        type: String,
        required: [true, "name is required"]
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    milestoneId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

export default mongoose.model("Epic", EpicSchema);