export class Endpoints {
  static readonly Auth = {
    REFRESH: "auth/refresh",
    GET_USER_BY_ID: (id: string) => `/User/${id}`
  }
}