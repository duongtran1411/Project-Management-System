import { Assignee } from "../assignee/assignee.model";
import { Epic } from "../epic/epic.model";
import { Reporter } from "../reporter/reporter.model";

export interface Task {
  _id?: string;
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: Assignee;
  epic?: Epic;
  reporter?: Reporter
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

export interface TaskModel {
  name: string;
  description: string;
  projectId: string;
  milestones?: string;
}
