import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import roleService, { RoleService } from "../services/role.service";
import { Types } from "mongoose";

class RoleController{
    updateRole = async(req: AuthRequest, res:Response, next: NextFunction):Promise<void> => {
        try {
            const {id} = req.params
            const permissionData = req.body.permissionIds
            const user = req.user

            if(!id){
                res.status(400).json({
                    message:"id is required"
                })
            }

            if(!Array.isArray(permissionData)){
                res.status(400).json({
                    message:"permission incorrect format"
                })
            }

            const permissionIds = permissionData.map((e: string) => new Types.ObjectId(e))
            const role = await roleService.addPermissionForRole(id,permissionIds,user)
            res.status(200).json({
                status:200,
                data: role,
                message: 'Update role success',
                success:true
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

    getAll = async(req: AuthRequest, res:Response, next: NextFunction):Promise<void> => {
        try {

            const roles = await roleService.getRoles();

            if(!roles){
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
}

export default new RoleController();