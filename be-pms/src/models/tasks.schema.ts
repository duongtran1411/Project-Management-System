import mongoose from "mongoose";
import User from "./users.schema";
import Project from "./projects.schema"
const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"]
    },
    description: {
        type: String,
        required: [true, "name is required"]
    },
    epic: {
        type: String,
        required: [false],
        default: "Backlog"
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startDate: {
        type: Date
    },
    dueDate: {
        type: Date
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
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

export default mongoose.model("Task", TaskSchema);