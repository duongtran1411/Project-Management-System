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
