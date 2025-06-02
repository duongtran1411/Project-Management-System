import mongoose from "mongoose";
import User from "./users.schema";

const WorkspaceSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required"]
    },
    description:{
        type:String,
        required:[true,"description is required"]
    },
    projectIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project'
    }],
    ownerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
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
export default mongoose.model("Workspace", WorkspaceSchema);