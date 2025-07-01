import { Role } from "../models";
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
}

export default new RoleService();
