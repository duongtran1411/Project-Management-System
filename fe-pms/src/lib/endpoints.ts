export class Endpoints {
  static readonly Auth = {
    REFRESH: 'auth/refresh',
    LOGIN: 'auth/login',
    LOGIN_WITH_GOOGLE: 'auth/google-login',
    GET_USER_BY_ID: (id: string) => `/User/${id}`
  }

}