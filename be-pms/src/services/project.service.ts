import { Epic, Task } from "../models";
import Project, { IProject } from "../models/project.model";
import ProjectContributor, {
    IProjectContributor,
} from "../models/project.contributor.model";
import mongoose from "mongoose";

export class ProjectService {
    

    async createProject(data: Partial<IProject>, user: any): Promise<any> {
        const project = await Project.create({
            ...data,
            projectLead: user._id,
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
