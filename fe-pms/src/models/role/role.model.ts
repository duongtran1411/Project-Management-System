export interface Role {
  _id?: string;
  name: string;
  description?: string;
  permissionIds?: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
}
