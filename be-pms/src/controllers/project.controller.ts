import { Request, Response, NextFunction } from "express";
import projectService from "../services/project.service";
export class ProjectController {
    getSummary = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const projectId = req.params.id
            if (!projectId) {
                res.status(400).json({
                    success: false,
                    message: "Project does not exist",
                    status: 400,
                })
            }
            const statisticalTask = await projectService.GetStatiscalTask(projectId);
            const statisticalEpicTask = await projectService.GetStatisticalEpic(projectId);
            const statisticalPriority = await projectService.getStatiscalPriority(projectId);
            res.status(200).json({
                success: true,
                message: 'get summary success',
                data: {
                    statisticalTask,
                    statisticalEpicTask,
                    statisticalPriority
                },
                status: 200
            })
        } catch (error) {
            const err = error as Error
            res.status(400).json({
                success: false,
                message: err.message,
                status: 400,
            })

        }
    }
}
export default new ProjectController();