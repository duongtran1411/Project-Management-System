export class Endpoints {
  static readonly Auth = {
    REFRESH: 'auth/refresh',
    LOGIN: 'auth/login',
    LOGIN_WITH_GOOGLE: 'auth/google-login',
    FORGOT_PASSWORD : 'auth/forgot-password',
    LOGIN_ADMIN: 'auth/check-admin-access',
  }

  static readonly User = {
    GET_ALL: 'user'
  }

  static readonly ActivityLog = {
    GET_ALL: 'activity-log'
  }

  static readonly Statistical = {
    GET_STATISTICAL : 'statistics'
  }

  static readonly Role = {
    GET_All: 'role',
    GET_BY_ID: (roleId:string) => `role/${roleId}`,
    UPDATE_PERMISSION: (roleId: string) => `role/${roleId}`,
    ADD_ROLE: '/role'
  }

  static readonly Permission = {
    ADD_PERMISSION: '/permission',
    GET_PERMISSION_BY_ID: (id:string)=> `permission/${id}`,
    UPDATE_PERMISSION : (id: string) => `permission/${id}`
  }


}