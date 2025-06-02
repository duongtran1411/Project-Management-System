import mongoose from "mongoose";

const ProjectRoleSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required"]
    },
    projectId:{
        
    },
    userId:{

    }
},{timestamps:true})

export default mongoose.model("ProjectRole", ProjectRoleSchema);