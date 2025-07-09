import { IRole, IUser, Role } from "../models";
import { Types } from "mongoose";
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
    const role = await Role.findByIdAndUpdate(roleId, { $addToSet: { permissionIds: { $each: permissionIds } }, updatedBy: user._id },{new: true});
    if (!role) {
      throw new Error(`Can not find role by id ${roleId}`);
    }
    return role
  }
}

export default new RoleService();
