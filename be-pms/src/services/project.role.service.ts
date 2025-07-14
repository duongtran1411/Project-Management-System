import { ProjectRole, IProjectRole } from "../models";
import { Types } from "mongoose";

export class ProjectRoleService {
  async getAllProjectRoles(): Promise<IProjectRole[]> {
    try {
      const projectRoles = await ProjectRole.find()
        .populate("projectpermissionIds", "_id name")
        .sort({ createdAt: -1 });
      return projectRoles;
    } catch (error) {
      throw new Error(`Error fetching project roles: ${error}`);
    }
  }

  async getProjectRoleById(
    roleId: Types.ObjectId
  ): Promise<IProjectRole | null> {
    try {
      const projectRole = await ProjectRole.findById(roleId).populate(
        "projectpermissionIds",
        "_id name"
      );
      return projectRole;
    } catch (error) {
      throw new Error(`Error fetching project role: ${error}`);
    }
  }

  async createProjectRole(
    roleData: Partial<IProjectRole>
  ): Promise<IProjectRole> {
    try {
      const newProjectRole = new ProjectRole(roleData);
      const savedProjectRole = await newProjectRole.save();
      return savedProjectRole;
    } catch (error) {
      throw new Error(`Error creating project role: ${error}`);
    }
  }

  async updateProjectRole(
    roleId: Types.ObjectId,
    updateData: Partial<IProjectRole>
  ): Promise<IProjectRole | null> {
    try {
      const updatedProjectRole = await ProjectRole.findByIdAndUpdate(
        roleId,
        updateData,
        { new: true, runValidators: true }
      ).populate("projectpermissionIds", "_id name");
      return updatedProjectRole;
    } catch (error) {
      throw new Error(`Error updating project role: ${error}`);
    }
  }

  async deleteProjectRole(roleId: Types.ObjectId): Promise<boolean> {
    try {
      const deletedProjectRole = await ProjectRole.findByIdAndDelete(roleId);
      return !!deletedProjectRole;
    } catch (error) {
      throw new Error(`Error deleting project role: ${error}`);
    }
  }
}

export default new ProjectRoleService();
