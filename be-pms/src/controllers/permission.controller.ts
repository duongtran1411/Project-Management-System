import { NextFunction, Request, Response } from "express";
import permissionService from "../services/permission.service";
import { AuthRequest } from "../middlewares/auth.middleware";

class PermissionController {
    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const permission = await permissionService.getAll();
            if (!permission) {
                res.status(400).json({
                    success: false,
                    message: "Permission no data",
                    status: 400
                })
            }

            res.status(200).json({
                success: true,
                status: 200,
                data: permission
            })

        } catch (error) {
            const err = error as Error
            res.status(500).json({
                status: 500,
                success: false,
                message: err.message
            })
        }
    }

    create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const permission = req.body
            const user = req.user
            const newPermission = await permissionService.create(permission, user);
            if (!newPermission) {
                res.status(400).json({
                    success: false,
                    status: 401,
                    message: 'Can not create permission'
                })
            }

            res.status(201).json({
                success: true,
                status: 201,
                message: 'Create permission successful'
            })
        } catch (error) {
            const err = error as Error
            res.status(500).json({
                status: 500,
                success: false,
                message: err.message
            })
        }
    }
}

export default new PermissionController();