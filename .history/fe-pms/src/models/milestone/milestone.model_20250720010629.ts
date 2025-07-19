export interface Milestone {
  _id: string;
  name: string;
  goal: string;
  projectId: string;
  status: "NOT_START" | "ACTIVE" | "COMPLETED";
  startDate?: string;
  end?: string;
}
export interface CreateMilestone {
  name: string;
  startDate?: string;
  end?: string;
  goal?: string;
  projectId: string;
}
