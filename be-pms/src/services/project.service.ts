import { Epic, Task } from "../models";
import Project, { IProject } from "../models/project.model";
import ProjectContributor, {
    IProjectContributor,
} from "../models/project.contributor.model";
import mongoose, { Types } from "mongoose";
import Workspace, { IWorkspace } from "../models/workspace.model";

export class ProjectService {
    async createProject(data: Partial<IProject>, user: any): Promise<any> {
        if (data.workspaceId) {
            const workspaceExists = await Workspace.exists({ _id: data.workspaceId });
            if (!workspaceExists) {
                throw new Error("Workspace not found");
            }
        }

        const nameQuery: any = { name: data.name };
        if (data.workspaceId) nameQuery.workspaceId = data.workspaceId;

        const duplicate = await Project.exists(nameQuery);
        if (duplicate) {
            throw new Error(
                "A project with the same name already exists in this workspace"
            );
        }

        const project = await Project.create({
            ...data,
            projectLead: user._id,
            defaultAssign: user._id,
            createdBy: user._id,
            updatedBy: user._id,
        });

        const populatedProject = await project.populate([
            { path: "projectLead", select: "fullName email" },
            { path: "defaultAssign", select: "fullName email" },
            { path: "workspaceId", select: "name" },
            { path: "createdBy", select: "fullName email" },
            { path: "updatedBy", select: "fullName email" },
        ]);

        return populatedProject.toObject();
    }
    async GetStatiscalTask(projectId: string) {
        const totalTask = await Task.countDocuments({ projectId });
        const taskProgress = await Task.countDocuments({ projectId, status: { $eq: 'IN_PROGRESS' } })
        const taskToDo = await Task.countDocuments({ projectId, status: { $eq: 'TO_DO' } })
        const taskDone = await Task.countDocuments({ projectId, status: { $eq: 'DONE' } })
        const percentProgress = (taskProgress / totalTask) * 100
        const percentToDo = (taskToDo / totalTask) * 100
        const percentDone = (taskDone / totalTask) * 100

        return {
            totalTask,
            taskProgress,
            taskToDo,
            taskDone,
            percentProgress,
            percentToDo,
            percentDone
        }

    }

    async GetStatisticalEpic(projectId: string) {


        const epicWithTask = await Task.aggregate([
            {
                $match: {
                    projectId: new Types.ObjectId(projectId)
                }
            },
            {
                $lookup: {
                    from: 'epics',
                    localField: 'epic',
                    foreignField: '_id',
                    as: 'epicData',

                }
            },
            {
                $unwind: '$epicData'
            },
            {
                $group: {
                    _id: {
                        epic: '$epic',
                        epicName: '$epicData.name',
                        status: '$epicData.status'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: {
                        epic: '$_id.epic',
                        epicname: '$_id.epicName'
                    },
                    total: { $sum: '$count' },
                    todo: {
                        $sum: {
                            $cond: [{ $eq: ['$_id.status', 'TO_DO'] }, "$count", 0]
                        }
                    },
                    inprogress: {
                        $sum: {
                            $cond: [{ $eq: ['$_id.status', 'IN_PROGRESS'] }, "$count", 0]
                        }
                    },
                    done: {
                        $sum: {
                            $cond: [{ $eq: ['$_id.status', 'DONE'] }, "$count", 0]
                        }
                    }

                }
            },
            {
                $project: {
                    _id: 0,
                    epic: "$_id.epic",
                    epicName: "$_id.epicName",
                    total: 1,
                    todoPercent: {
                        $cond: [
                            { $eq: ["$total", 0] }, 0,
                            { $round: [{ $multiply: [{ $divide: ["$todo", "$total"] }, 100] }, 2] }
                        ]
                    },
                    inProgressPercent: {
                        $cond: [
                            { $eq: ["$total", 0] },
                            0,
                            { $round: [{ $multiply: [{ $divide: ["$inprogress", "$total"] }, 100] }, 2] }
                        ]
                    },
                    donePercent: {
                        $cond: [
                            { $eq: ["$total", 0] },
                            0,
                            { $round: [{ $multiply: [{ $divide: ["$done", "$total"] }, 100] }, 2] }
                        ]
                    }
                }
            }
        ])
        return { epicWithTask }
    }

    async getStatiscalPriority(projectId: string) {
        const taskPriority = await Task.aggregate([
            {
                $match: {
                    projectId: new Types.ObjectId(projectId)
                }
            },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    priority: '$_id',
                    quantity: '$count'
                }
            }
        ])

        console.log(taskPriority);

        return { taskPriority }
    }



    async getAllProjects(): Promise<any[]> {
        const projects = await Project.find()
            .populate([
                { path: "projectLead", select: "fullName email" },
                { path: "defaultAssign", select: "fullName email" },
                { path: "workspaceId", select: "name" },
                { path: "createdBy", select: "fullName email" },
                { path: "updatedBy", select: "fullName email" },
            ])
            .sort({ createdAt: -1 })
            .lean();

        return projects;
    }

    async getProjectById(projectId: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(projectId)) return null;

        const project = await Project.findById(projectId).populate([
            { path: "projectLead", select: "fullName email" },
            { path: "defaultAssign", select: "fullName email" },
            { path: "workspaceId", select: "name" },
            { path: "createdBy", select: "fullName email" },
            { path: "updatedBy", select: "fullName email" },
        ]);

        return project?.toObject() || null;
    }

    async updateProject(
        projectId: string,
        updateData: Partial<IProject>,
        user: any
    ): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(projectId)) return null;

        const updated = await Project.findByIdAndUpdate(
            projectId,
            { ...updateData, updatedBy: user._id },
            { new: true, runValidators: true }
        ).populate([
            { path: "projectLead", select: "fullName email" },
            { path: "defaultAssign", select: "fullName email" },
            { path: "workspaceId", select: "name" },
            { path: "createdBy", select: "fullName email" },
            { path: "updatedBy", select: "fullName email" },
        ]);

        return updated?.toObject() || null;
    }

    async deleteProject(projectId: string): Promise<boolean> {
        if (!mongoose.Types.ObjectId.isValid(projectId)) return false;

        const deleted = await Project.findByIdAndDelete(projectId);
        if (!deleted) return false;

        await ProjectContributor.deleteMany({ projectId });

        return true;
    }
}

export default new ProjectService();
