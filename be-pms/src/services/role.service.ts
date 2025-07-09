import { IRole, IUser, Role } from "../models";
import { isValidObjectId, Types } from "mongoose";
export class RoleService {
  async getRoleById(roleId: Types.ObjectId): Promise<string> {
    const role = await Role.findById(roleId);

    if (!role) {
      throw new Error("RoleId not exist");
    }
    const roleName: string = role.name;
    return roleName;
  }

  async addPermissionForRole(roleId: string, permissionIds: Types.ObjectId[], user: IUser): Promise<IRole> {
    const role = await Role.findByIdAndUpdate(roleId, { permissionIds: permissionIds, updatedBy: user._id }, { new: true });
    if (!role) {
      throw new Error(`Can not find role by id ${roleId}`);
    }
    return role
  }

  async getById(roleId: string): Promise<IRole> {
    const role = await Role.findById(roleId).populate({
      path: 'permissionIds',
      select: '_id code'
    }).select('-_id -name -description -updatedAt -createdAt -updatedBy -__v');
    if (!role) {
      throw new Error('No role data');
    }
    return role
  }

  async getAll(): Promise<IRole[]> {
    const roles = await Role.find({}).select('_id name');
    if (!roles) {
      throw new Error('No role data');
    }

    return roles
  }

}

export default new RoleService();
