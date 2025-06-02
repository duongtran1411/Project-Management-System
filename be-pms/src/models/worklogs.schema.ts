import mongoose from "mongoose";
import Task from "./tasks.schema";
import User from "./users.schema";
const WorklogSchema = new mongoose.Schema({
    contributor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
    },
    taskId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Task
    },
    description:{
        type:String,
        required:[true,"description is required"]
    },
    timeSpent:{
        type:Number,
        required:[true,"Timespent is required"]
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

export default mongoose.model("Worklog", WorklogSchema);