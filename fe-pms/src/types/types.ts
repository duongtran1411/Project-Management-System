export interface Task {
  _id?: string;
  name: string;
  description: string;
  status?: string;
  priority?: string;
  assignee?: {
    _id: string;
    name?: string;
    email?: string;
  };
  epic?: {
    _id: string;
    name: string;
  };
  startDate?: string;
  dueDate?: string;
  milestones?: {
    _id: string;
    name?: string;
  };
}

export interface Epic {
  _id: string;
  name: string;
}

export interface Milestone {
  _id: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  goal: string;
  projectId: string;
}

export type FieldType = {
  taskName?: string;
  taskDescription?: string;
};

export interface TaskModel {
  name: string;
  description: string;
  projectId: string;
  milestones?: string;
}

export interface CreateMilestone {
  name: string;
  startDate?: string;
  endDate?: string;
  goal?: string;
  projectId: string;
}

export interface Contributor {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    avatar: string;
  };
  roleId: string | null;
  joinedAt: string;
}

export interface ProjectContributor {
  _id?: string;
  userId: string;
  projectId: string;
  projectRoleId: string | null;
  joinedAt?: Date;
}

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

export interface Role {
  _id?: string;
  name: string;
  description?: string;
  permissionIds?: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
}
