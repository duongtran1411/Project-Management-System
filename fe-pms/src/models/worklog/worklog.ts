export interface Worklog {
  _id?: string;
  contributor: {
    _id: string;
    fullName?: string;
    email?: string;
    avatar?: string;
  };
  taskId: {
    _id: string;
    name: string;
  };
  description?: string;
  timeSpent: number; // required
  timeRemain?: number;
  startDate?: string; // ISO 8601
  createdBy?: {
    _id: string;
    fullName?: string;
    email?: string;
  };
  updatedBy?: {
    _id: string;
    fullName?: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface WorklogModel {
  taskId: string;
  timeSpent: number;
  timeRemain?: number;
  startDate?: string;
  description?: string;
  contributor: string;
}
