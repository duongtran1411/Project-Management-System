import mongoose from "mongoose";
import Project from "./projects.schema";
import User from "./users.schema";
const MilestoneSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required"]
    },
    startDate:{
        type:Date,
        default:Date.now
    },
    endDate:{
        type:Date,
        default:Date.now
    },
    goal:{
        type:String,
        required:[false]
    },
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project'
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    updatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true})

export default mongoose.model("Milestone", MilestoneSchema);