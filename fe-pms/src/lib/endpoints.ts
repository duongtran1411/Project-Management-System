export class Endpoints {
  static readonly Auth = {
    REFRESH: "auth/refresh",
    LOGIN: "auth/login",
    LOGIN_WITH_GOOGLE: "auth/google-login",
    FORGOT_PASSWORD: "auth/forgot-password",
  };

  static readonly User = {
    GET_ALL: "user",
    GET_BY_PROJECT: (projectId: string) => `user/project/${projectId}`,
  };

  static readonly Epic = {
    GET_BY_PROJECT: (projectId: string) => `epic/project/${projectId}`,
  };

  static readonly Task = {
    GET_BY_PROJECT: (projectId: string) => `task/project/${projectId}`,
  };
}
