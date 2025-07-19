export interface Project {
  _id?: string;
  name: string;
  icon?: string;
  description?: string;
  projectType?: string;
  projectLead?: string;
  defaultAssign?: string;
  workspaceId?: string;
  status?: string;
}
