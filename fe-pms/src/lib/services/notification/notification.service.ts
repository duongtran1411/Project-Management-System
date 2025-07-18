import { showErrorToast } from "@/components/common/toast/toast";
import { Endpoints } from "@/lib/endpoints";
import { NotificationQuery } from "@/models/notification/notification";
import axiosService from "../axios.service";

export const getNotifications = async (query: NotificationQuery) => {
  try {
    const params = new URLSearchParams();
    params.append("recipientId", query.recipientId);
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.isRead !== undefined)
      params.append("isRead", query.isRead.toString());
    if (query.isArchived !== undefined)
      params.append("isArchived", query.isArchived.toString());
    if (query.type) params.append("type", query.type);
    if (query.entityType) params.append("entityType", query.entityType);

    const response = await axiosService
      .getAxiosInstance()
      .get(`${Endpoints.Notification.GET_NOTIFICATIONS}?${params.toString()}`);

    return response.data.data;
  } catch (error: any) {
    if (error) {
      showErrorToast(
        error.response?.data?.message || "Failed to get notifications!"
      );
    }
  }
};

export const getNotificationStats = async (recipientId: string) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .get(`${Endpoints.Notification.GET_STATS}?recipientId=${recipientId}`);

    return response.data.data;
  } catch (error: any) {
    if (error) {
      showErrorToast(
        error.response?.data?.message || "Failed to get notification stats!"
      );
    }
  }
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(`${Endpoints.Notification.MARK_AS_READ(notificationId)}`, {
        userId,
      });

    return response.data.data;
  } catch (error: any) {
    if (error) {
      showErrorToast(
        error.response?.data?.message || "Failed to mark notification as read!"
      );
    }
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(Endpoints.Notification.MARK_ALL_AS_READ);

    return response.data.data;
  } catch (error: any) {
    if (error) {
      showErrorToast(
        error.response?.data?.message ||
          "Failed to mark all notifications as read!"
      );
    }
  }
};

export const archiveNotification = async (
  notificationId: string,
  userId: string
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .patch(`${Endpoints.Notification.ARCHIVE(notificationId)}`, {
        userId,
      });

    return response.data.data;
  } catch (error: any) {
    if (error) {
      showErrorToast(
        error.response?.data?.message || "Failed to archive notification!"
      );
    }
  }
};

export const deleteNotification = async (
  notificationId: string,
  userId: string
) => {
  try {
    const response = await axiosService
      .getAxiosInstance()
      .delete(`${Endpoints.Notification.DELETE(notificationId)}`, {
        data: { userId },
      });

    return response.data.data;
  } catch (error: any) {
    if (error) {
      showErrorToast(
        error.response?.data?.message || "Failed to delete notification!"
      );
    }
  }
};
