import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import roleService, { RoleService } from "../services/role.service";
import { Types } from "mongoose";
import permissionService from "../services/permission.service";

class RoleController {
    updateRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params
            const permissionData = req.body.permissionIds
            const user = req.user

            if (!id) {
                throw new Error('id is required')
            }

            if (!Array.isArray(permissionData)) {
                throw new Error('Data incorrect format')
            }

            const permissionIds = permissionData.map((e: string) => new Types.ObjectId(e))
            const role = await roleService.addPermissionForRole(id, permissionIds, user)
            res.status(200).json({
                status: 200,
                data: role,
                message: 'Update role success',
                success: true
            })
        } catch (error) {
            const err = error as Error;
            res.status(400).json({
                success: false,
                status: 400,
                message: err.message
            })
        }
    }

    getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params
            console.log(id);
            const roles = await roleService.getById(id);
            const permissions = await permissionService.getAll();
            if (!roles) {
                res.status(400).json({
                    success: false,
                    status: 400,
                    message: 'can not get role data'
                })
            }

            res.status(200).json({
                success: true,
                status: 200,
                data: {
                    permissionSelect: roles,
                    allPermission: permissions
                }
            })
        } catch (error) {
            const err = error as Error;
            res.status(400).json({
                success: false,
                status: 400,
                message: err.message
            })
        }
    }

    getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roles = await roleService.getAll();

            if (!roles) {
                res.status(400).json({
                    success: false,
                    status: 400,
                    message: 'can not get role data'
                })
            }

            res.status(200).json({
                success: true,
                status: 200,
                data: roles
            })
        } catch (error) {
            const err = error as Error;
            res.status(400).json({
                success: false,
                status: 400,
                message: err.message
            })
        }
    }

    create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const role = req.body
            const user = req.user
            const newRole = await roleService.addRole(role, user);
            if (!newRole) {
                res.status(400).json({
                    success: false,
                    status: 401,
                    message: 'Can not create role'
                })
            }

            res.status(201).json({
                success: true,
                status: 201,
                message: 'Create successful',
                data: newRole
            })
        } catch (error) {
            const err = error as Error;
            res.status(400).json({
                success: false,
                status: 400,
                message: err.message
            })
        }
    }
}

export default new RoleController();