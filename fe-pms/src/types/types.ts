export interface Task {
  _id?: string;
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: {
    _id: string
    fullName?: string
    email?: string
    avatar:string
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
  createdBy?: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  updatedBy?: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  updatedAt?: string;
  createdAt?: string;
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

export interface ProjectRole {
  _id?: string;
  name: string;
  projectpermissionIds?: string[];
}

// priority statistic
export interface PriorityStat {
  count: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  percentage: string;
}

export interface PriorityStatsResponse {
  totalTasks: number;
  priorityStats: PriorityStat[];
}

export interface TaskApiResponse {
  _id: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  dueDate?: string;
  assignee?: {
    _id: string;
    fullName: string;
  };
  epic?: {
    _id: string;
    name: string;
  };
}

export interface UITask {
  id: string;
  title: string;
  assignee: string;
  tags: string[];
  dueDate: string;
  status: string;
  priority: string;
  raw: TaskApiResponse;
}

// Task statistic
export interface TaskStatusStats {
  count: number;
  status: string;
  percentage: string;
}

export interface TaskStatistic {
  totalTasks: number;
  taskStatusStats: TaskStatusStats[];
}

// statistic task follow contributor
export interface ContributorStats {
  count: number;
  assignee: string;
  userName: string;
  percentage: string;
}
export interface TaskContributorStatistic {
  totalTasks: number;
  contributorStats: ContributorStats[];
}

// project invite multiple member
export interface InviteMultiple {
  emails: string[];
  projectId: string;
  projectRoleId: string;
}
