
import axiosService from "./axios.service";
import { Endpoints } from "@/lib/endpoints";
import { Project } from "@/models/project/project.model";
import { showErrorToast } from "@/components/common/toast/toast";

class ProjectService {
    public async getProjectByWorkspace(workspaceId: string): Promise<Project[]> {
        try {
            const response = await axiosService.getAxiosInstance().get(`workspace/${workspaceId}/projects`);
            return response.data.data;
        } catch (error: any) {
            showErrorToast(error.response.data.message || "Failed to get projects!");
            return [];
        }
    }
    public async getProjectById(projectId: string): Promise<Project> {
        try {
            const response = await axiosService.getAxiosInstance().get(`${Endpoints.Project.GET_BY_ID(projectId)}`);
            return response.data.data;
        } catch (error: any) {
            showErrorToast(error.response.data.message || "Failed to get project!");
            throw error;
        }
    }
}
export const projectService = new ProjectService(); 