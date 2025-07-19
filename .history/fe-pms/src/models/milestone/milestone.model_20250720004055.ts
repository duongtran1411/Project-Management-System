export interface Milestone {
  _id: string;
  name: string;
  goal: string;
  projectId: string;
  status: "NOT_START" | "ACTIVE" | "COMPLETED";
  startDate?: string;
  dueDate?: string;
}
export interface CreateMilestone {
  name: string;
  startDate?: string;
  dueDate?: string;
  goal?: string;
  projectId: string;
}
