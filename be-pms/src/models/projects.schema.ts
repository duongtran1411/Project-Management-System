import mongoose from "mongoose";
import Workspace from "./workspaces.schema";
import User from "./users.schema";
const ProjectSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required"]
    },
    icon:{
        type:String,
        default:"sonditrongmua"
    },
    projectType:{
        enum: {
        values: ["SOFTWARE", "MARKETING", "SALES"],
        message: "ProjectType must be 'SOFTWARE', 'MARKETING', or 'SALES'.",
        }
    },
    projectLead:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    defaultAssign:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    workspaceId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Workspace' 
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

export default mongoose.model("Project", ProjectSchema);