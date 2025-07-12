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
      `projectContributor/project/${projectId}`,
  };

  static readonly Epic = {
    GET_BY_PROJECT: (projectId: string) => `epic/project/${projectId}`,
  };

  static readonly Task = {
    GET_BY_PROJECT: (projectId: string) => `task/project/${projectId}`,
    CREATE_TASK: "task",
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
      `projectContributor/user/${userId}/projects`,
    CREATE_PROJECT_CONTRIBUTOR: "project-contributor",
  };

  static readonly Statistics = {
    SEARCH_BY_PROJECT: (searchTerm: string) =>
      `statistics/search/projects?searchTerm=${searchTerm}`,
  };
}
