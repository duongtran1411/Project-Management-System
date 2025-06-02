import mongoose from "mongoose";

const ProjectPermissionSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required"]
    },
    description:{
        type:String
    },
    code:{
        type:String,
        required:[true,"code is required"]
    }
},{timestamps:true});

export default mongoose.model('ProjectPermission',ProjectPermissionSchema);