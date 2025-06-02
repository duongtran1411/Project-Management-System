import mongoose from "mongoose";
const RoleSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required"]
    },
    description:{
        type:String,
        required:[false]
    },
    permissionIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Permission'
    }]
},{timestamps:true});

export default mongoose.model("Role", RoleSchema);