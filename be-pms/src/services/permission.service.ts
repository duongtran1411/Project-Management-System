import { IPermission, IUser, Permission } from "../models";

class PermissionService {
    async getAll(): Promise<IPermission[]> {
        const permissions = await Permission.find({});
        if (!permissions) {
            throw new Error('no data of permission')
        }
        return permissions;
    }

    async create(permissionData: IPermission, user: IUser):Promise<IPermission>{
        const permission = await Permission.create({
            code: permissionData.code,
            description: permissionData.description,
            createdBy: user._id
        })
        return permission;
    }
}
export default new PermissionService();