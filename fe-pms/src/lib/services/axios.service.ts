import { Constants } from "@/lib/constants";
import { Endpoints } from "@/lib/endpoints";

import axios, { type AxiosInstance, AxiosError } from "axios";
import { logout } from "../utils";
import SuccessResponse from "./response/SuccessResponse";
import FailureResponse from "./response/FailureResponse";
class AxiosService {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshQueue: Array<(token: string) => void> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
    });

    this.addInterceptors();
  }

  /**
   * Add request and response interceptors
   */
  private addInterceptors() {
    this.instance.interceptors.request.use((config) => {
      const token = localStorage.getItem(Constants.API_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.instance.interceptors.response.use(
      (response) => this.handleResponse(response),
      async (error) => {
        const originalRequest = error.config;

        if (originalRequest?.url?.includes("/authentication/login")) {
          return Promise.reject(error);
        }

       
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem(Constants.API_REFRESH_TOKEN_KEY);
            if (!refreshToken) {
              return Promise.reject(error);
            }

            // Gọi API refresh token
            const refreshResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${Endpoints.Auth.REFRESH}`, {
              refresh_token: refreshToken,
            });

            const { accessToken } = refreshResponse.data.data.access_token;

            // Lưu lại token mới
            localStorage.setItem(Constants.API_TOKEN_KEY, accessToken);

            // Gán access token mới vào header
            this.instance.defaults.headers.Authorization = `Bearer ${accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Retry lại request cũ
            return this.instance(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem(Constants.API_TOKEN_KEY);
            localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);
            window.location.href = "/authentication/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

  }

  /**
   * Handle responses with specific status codes
   */
  private handleResponse(response: any) {
    switch (response.status) {
      case 200: {
        const successResponse = new SuccessResponse("Success", response.data);
        return successResponse;
      }

      case 400: {
        const failureResponse = new FailureResponse({
          code: response.status.toString(),
          message: response.data.message || "Request failed.",
          success: false,
        });
        return Promise.reject(failureResponse);
      }

      default: {
        return response;
      }
    }
  }

  /**
   * Handle 401 Unauthorized errors
   */
  private async handle401Error(error: AxiosError) {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshQueue.push((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(this.instance(originalRequest));
        });
      });
    }

    this.isRefreshing = true;
    const refreshToken = localStorage.getItem(Constants.API_REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      this.handleLogout();
      return Promise.reject(error);
    }

    if (originalRequest?.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }
    try {
      const { data } = await this.instance.post(Endpoints.Auth.REFRESH, {
        refreshToken,
      });
      const newToken = data.accessToken;
      localStorage.setItem(Constants.API_TOKEN_KEY, newToken);

      // Resolve all queued requests with the new token
      this.refreshQueue.forEach((callback) => callback(newToken));
      this.refreshQueue = [];

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return this.instance(originalRequest);
    } catch (refreshError) {
      this.handleLogout();
      return Promise.reject(refreshError);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Handle logout by clearing tokens and redirecting to login
   */
  private handleLogout() {
    logout();
  }

  /**
   * Create a new AbortSignal for request cancellation
   */
  public createAbortSignal(): AbortSignal {
    return new AbortController().signal;
  }

  /**
   * Get Axios instance
   */
  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

const axiosService = new AxiosService();
export default axiosService;
