export interface Milestone {
  _id: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  goal: string;
  projectId: string;
}
export interface CreateMilestone {
  name: string;
  startDate?: string;
  endDate?: string;
  goal?: string;
  projectId: string;
}
