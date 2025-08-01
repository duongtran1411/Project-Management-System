export class Endpoints {
  static readonly Auth = {
    REFRESH: "auth/refresh",
    LOGIN: "auth/login",
    LOGIN_WITH_GOOGLE: "auth/google-login",
    FORGOT_PASSWORD: "auth/forgot-password",
    CHANGE_PASSWORD: "auth/change-password",
    VERIFY_FORGOT_PASSWORD: "auth/verify-otp-reset-password",

    REGISTER: "auth/register",
    VERIFY_REGISTRATION_OTP: "auth/verify-registration-otp",
    RESEND_REGISTRATION_OTP: "auth/resend-registration-otp",
    SETUP_ACCOUNT: "auth/setup-account",
  };

  static readonly User = {
    GET_ALL: "user",
    GET_BY_PROJECT: (projectId: string) =>
      `project-contributor/project/${projectId}`,
    UPDATE: (userId: string) => `user/${userId}/updateProfile`,
    GET_BY_ID: (userId: string) => `user/${userId}`,
  };

  static readonly Epic = {
    GET_BY_PROJECT: (projectId: string) => `epic/project/${projectId}`,
    GET_BY_ID: (epicId: string) => `epic/${epicId}`,
    CREATE_EPIC: "epic",
    UPDATE_EPIC: (epicId: string) => `epic/${epicId}`,
    DELETE_EPIC: (epicId: string) => `epic/${epicId}`,
  };

  static readonly Task = {
    GET_MY_TASKS: "task/my-tasks",
    GET_BY_PROJECT: (projectId: string) => `task/project/${projectId}`,
    GET_BY_MILESTONE: (milestoneId: string) => `task/milestone/${milestoneId}`,
    CREATE_TASK: "task",
    UPDATE_TASK: (taskId: string) => `task/${taskId}`,
    DELETE_TASKS: "task/bulk-delete",
    DELETE_TASK: (taskId: string) => `task/${taskId}`,
    GET_BY_ASSIGNEE: (userId: string) => `task/assignee/${userId}`,
    GET_BY_ID: (taskId: string) => `task/${taskId}`,
    GET_BY_EPIC: (epicId: string) => `task/epic/${epicId}`,
    UPDATE_STATUS: (taskId: string) => `task/${taskId}/status`,
    UPDATE_PRIORITY: (taskId: string) => `task/${taskId}/priority`,
    UPDATE_ASSIGNEE: (taskId: string) => `task/${taskId}/assignee`,
    UPDATE_EPIC: (taskId: string) => `task/${taskId}/epic`,
    UPDATE_DATE: (taskId: string) => `task/${taskId}/dates`,
    UPDATE_REPORTER: (taskId: string) => `task/${taskId}/reporter`,
    UPDATE_MILESTONE: (taskId: string) => `task/${taskId}/milestone`,
    UPDATE_NAME: (taskId: string) => `task/${taskId}/name`,
    UPDATE_DESCRIPTION: (taskId: string) => `task/${taskId}/description`,
    UPDATE_LABELS: (taskId: string) => `task/${taskId}/labels`,
    COUNT_NUMBER_TASK_NOT_DONE: (milestonesId: string) =>
      `task/count/${milestonesId}`,
    GET_TASK_BOARD_BY_PROJECT_ID: (projectId: string) =>
      `task/board/${projectId}`,
    UPDATE_MILESTONES_FOR_TASK: (milestoneId: string) =>
      `/task/updatemilestones/task/${milestoneId}`,
    MY_TASKS: "task/my-tasks",
  };

  static readonly Milestone = {
    MILESTONE: "milestone",
    UPDATE_STATUS: (milestoneId: string) => `milestone/${milestoneId}/status`,
    GET_BY_PROJECT: (projectId: string) => `milestone/project/${projectId}`,
    GET_BY_ACTIVE: (projectId: string) =>
      `milestone/active/project/${projectId}`,
    GET_BY_NOT_START: (projectId: string) =>
      `milestone/notstart/project/${projectId}`,
  };

  static readonly Workspace = {
    GET_BY_ID: (workspaceId: string) => `workspace/${workspaceId}`,
    CREATE: "workspace",
    GET_BY_USER: "workspace/getbyuser",
  };

  static readonly Project = {
    CREATE_PROJECT: "project",
    GET_BY_ID: (projectId: string) => `project/${projectId}`,
    UPDATE_PROJECT: (projectId: string) => `project/${projectId}`,
    DELETE_PROJECT: (projectId: string) => `project/${projectId}`,
    TRASH_PROJECT: "project/deleted",
    RESTORE_PROJECT: (projectId: string) => `project/${projectId}/restore`,
  };

  static readonly ProjectContributor = {
    GET_CONTRIBUTOR_BY_PROJECT: (projectId: string) =>
      `project-contributor/project/${projectId}`,
    GET_PROJECTS_BY_USER: (userId: string) =>
      `project-contributor/user/${userId}/projects`,
    CREATE_PROJECT_CONTRIBUTOR: "project-contributor",
    GET_USER_BY_PROJECT: (projectId: string) =>
      `project-contributor/project/${projectId}/users`,
    INVITE_MULTIPLE: "project-contributor/invitation/multiple",
    CONFIRM_INVITE: (token: string) =>
      `project-contributor/invitation/confirm/${token}`,
    GET_ROLE_PROJECT_ID: (projectId: string) =>
      `project-contributor/project/role/${projectId}`,
    DELETE_CONTRIBUTOR: (contributorId: string) =>
      `project-contributor/${contributorId}`,
    UPDATE_PROJECT_ROLE: (contributorId: string) =>
      `project-contributor/${contributorId}`,
    PROJECT_STATISTICS: (projectId: string) =>
      `project-contributor/project/${projectId}/statistics`,
    GET_PROJECT_BY_USER: (userId: string) =>
      `project-contributor/user/${userId}/projects`,
    CHANGE_PROJECT_LEAD: (projectId: string) =>
      `project-contributor/project/${projectId}/update-lead`,
    GET_BY_PROJECT_ID: (projectId: string) =>
      `/project-contributor/getcontributor/${projectId}`,
    GET_USER_LIST: (projectId: string) =>
      `project-contributor/project/${projectId}/users`,
    GET_CONTRIBUTOR_BY_PROJECT_ID: (userId: string) =>
      `project-contributor/user/${userId}/contributor-projects`,
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

  static readonly Comment = {
    GET_COMMENT_BY_TASK: (taskId: string) => `comment/${taskId}`,
    CREATE_COMMENT: "comment",
    UPDATE_COMMENT: (commentId: string) => `comment/${commentId}`,
    DELETE_COMMENT: (commentId: string) => `comment/${commentId}`,
  };

  static readonly Notification = {
    GET_NOTIFICATIONS: "notification",
    GET_STATS: "notification/stats",
    MARK_AS_READ: (notificationId: string) =>
      `notification/${notificationId}/read`,
    MARK_ALL_AS_READ: "notification/mark-all-read",
    ARCHIVE: (notificationId: string) =>
      `notification/${notificationId}/archive`,
    DELETE: (notificationId: string) => `notification/${notificationId}`,
  };

  static readonly PeopleYouWorkWith = {
    GET_ALL: "people-you-work-with",
    GET_BY_PROJECT: (projectId: string) =>
      `people-you-work-with/project/${projectId}`,
  };

  static readonly Worklog = {
    GET_ALL: "worklog",
    GET_BY_ID: (worklogId: string) => `worklog/${worklogId}`,
    GET_BY_TASK: (taskId: string) => `worklog/task/${taskId}`,
    GET_BY_PROJECT: (projectId: string) => `worklog/project/${projectId}`,
    GET_BY_CONTRIBUTOR: (userId: string) => `worklog/contributor/${userId}`,
    CREATE_WORKLOG: "worklog",
    UPDATE_WORKLOG: (worklogId: string) => `worklog/${worklogId}`,
    DELETE_WORKLOG: (worklogId: string) => `worklog/${worklogId}`,
    STATISTIC_BY_PROJECT: (projectId: string) =>
      `worklog/statistics/project/${projectId}`,
    WORKLOG_TOPS: (projectId: string) =>
      `worklog/top-contributors/${projectId}`,
    WORKLOG_BY_CONTRIBUTOR: (userId: string) => `worklog/contributor/${userId}`,
  };

  static readonly Feedback = {
    CREATE: "feedback",
    GET_BY_PROJECT_ID: (projectId: string) => `feedback/${projectId}`,
    UPDATE: (feedbackId: string) => `feedback/${feedbackId}`,
  };
}
