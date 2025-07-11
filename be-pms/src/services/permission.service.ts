import { IPermission, IUser, Permission } from "../models";

class PermissionService {
    async getAll(): Promise<IPermission[]> {
        const permissions = await Permission.find({}).select('_id code');
        if (!permissions) {
            throw new Error('no data of permission')
        }
        return permissions;
    }

    async create(permissionData: IPermission, user: IUser): Promise<IPermission> {
        const permission = await Permission.create({
            code: permissionData.code,
            description: permissionData.description,
            createdBy: user._id
        })
        return permission;
    }

    async getById(permissionId: string): Promise<IPermission> {
        const permission = await Permission.findById(permissionId).select('_id code description');
        if (!permission) {
            throw new Error(`Can not find id : ${permissionId}`)
        }

        return permission
    }

    async updatePermission(permissionId: string, permissionData: IPermission, user: IUser): Promise<IPermission> {
        const permission = await Permission.findByIdAndUpdate({
            _id: permissionId
        }, {
            code: permissionData.code,
            description: permissionData.description,
            updatedBy: user._id
        })

        if(!permission){
            throw new Error(`Can not update Id: ${permissionId}`)
        }
        return permission
    }
}
export default new PermissionService();