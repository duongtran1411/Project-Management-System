export class Endpoints {
  static readonly Auth = {
    REFRESH: "auth/refresh",
    LOGIN: "auth/login",
    LOGIN_WITH_GOOGLE: "auth/google-login",
    FORGOT_PASSWORD: "auth/forgot-password",
  };

  static readonly User = {
    GET_ALL: "user",
    GET_BY_PROJECT: (projectId: string) =>
      `project-contributor/project/${projectId}`,
  };

  static readonly Epic = {
    GET_BY_PROJECT: (projectId: string) => `epic/project/${projectId}`,
  };

  static readonly Task = {
    GET_BY_PROJECT: (projectId: string) => `task/project/${projectId}`,
    CREATE_TASK: "task",
    UPDATE_TASK: (taskId: string) => `task/${taskId}`,
    GET_BY_ID: (taskId: string) => `task/${taskId}`,
    UPDATE_STATUS: (taskId: string) => `task/${taskId}/status`,
    UPDATE_PRIORITY: (taskId: string) => `task/${taskId}/priority`,
  };

  static readonly Milestone = {
    MILESTONE: "milestone",
    GET_BY_PROJECT: (projectId: string) => `milestone/project/${projectId}`,
  };

  static readonly Workspace = {
    GET_BY_ID: (workspaceId: string) => `workspace/${workspaceId}`,
  };

  static readonly Project = {
    CREATE_PROJECT: "project",
    GET_BY_ID: (projectId: string) => `project/${projectId}`,
  };

  static readonly ProjectContributor = {
    GET_PROJECTS_BY_USER: (userId: string) =>
      `project-contributor/user/${userId}/projects`,
    INVITE_MULTIPLE: "project-contributor/invitation/multiple",
    CONFIRM_INVITE: (token: string) =>
      `project-contributor/invitation/confirm/${token}`,
  };

  static readonly ProjectRole = {
    GET_ALL: "project-role",
  };

  static readonly Statistics = {
    SEARCH_BY_PROJECT: (searchTerm: string) =>
      `statistics/search/projects?searchTerm=${searchTerm}`,
    TASK_PRIORITY: (projectId: string) =>
      `statistics/project/${projectId}/priority`,
    STATISTIC_TASK: (projectId: string) =>
      `statistics/project/${projectId}/tasks`,
    STATISTIC_EPIC: (projectId: string) =>
      `statistics/project/${projectId}/epics`,
    STATISTIC_CONTRIBUTOR: (projectId: string) =>
      `statistics/project/${projectId}/contributors`,
  };
}
