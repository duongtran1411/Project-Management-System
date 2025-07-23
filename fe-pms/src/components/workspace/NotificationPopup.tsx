import {
  formatTimeAgo,
  getCurrentUserId,
  getUserAvatar,
  groupNotificationsByDate,
} from "@/helpers/utils";
import {
  getNotifications,
  getNotificationStats,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/services/notification/notification.service";
import {
  INotification,
  NotificationStats,
} from "@/models/notification/notification.model";
import {
  BellOutlined,
  CheckCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Spin,
  Switch,
  Tabs,
  Typography,
} from "antd";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { useRouter } from "next/navigation";

const { Text, Title } = Typography;

const NotificationPopup: React.FC = () => {
  const [activeTab, setActiveTab] = useState("direct");
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { connected } = useSocket();
  const router = useRouter();

  useEffect(() => {
    const currentUserId = getCurrentUserId();
    setUserId(currentUserId);
  }, []);

  useSocketEvent(
    "new-notification",
    (data: { notification: INotification }) => {
      setNotifications((prev) => [data.notification, ...prev]);
      setStats((prev) =>
        prev
          ? { ...prev, unread: prev.unread + 1, total: prev.total + 1 }
          : null
      );
    },
    [userId]
  );
  useSocketEvent(
    "notification-read",
    (data: { notificationId: string }) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === data.notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setStats((prev) =>
        prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : null
      );
    },
    [userId]
  );
  useSocketEvent(
    "all-notifications-read",
    () => {
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setStats((prev) => (prev ? { ...prev, unread: 0 } : null));
    },
    [userId]
  );
  useSocketEvent(
    "notification-stats-updated",
    (data: { stats: NotificationStats }) => {
      setStats(data.stats);
    },
    [userId]
  );

  const fetchNotifications = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await getNotifications({
          recipientId: userId,
          page: pageNum,
          limit: 10,
          isArchived: false,
          isRead: showOnlyUnread ? false : undefined,
        });

        if (response && response.notifications) {
          if (append) {
            setNotifications((prev) => [...prev, ...response.notifications]);
          } else {
            setNotifications(response.notifications);
          }
          setHasMore(response.page < response.totalPages);
          setPage(response.page);
        } else {
          if (!append) {
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    },
    [userId, showOnlyUnread]
  );

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await getNotificationStats(userId);
      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error("Failed to fetch notification stats:", error);
    }
  }, [userId]);

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      try {
        const updatedNotification = await markNotificationAsRead(
          notificationId,
          userId
        );
        if (updatedNotification) {
          await Promise.all([fetchNotifications(), fetchStats()]);
        }
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },
    [userId, fetchNotifications, fetchStats]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const result = await markAllNotificationsAsRead();
      if (result) {
        await Promise.all([fetchNotifications(), fetchStats()]);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, [fetchNotifications, fetchStats]);

  const handleToggleUnread = useCallback((checked: boolean) => {
    setShowOnlyUnread(checked);
    setDropdownOpen(true);
  }, []);

  const handleSwitchClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleMarkAllAsReadClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleMarkAllAsRead();
    },
    [handleMarkAllAsRead]
  );

  const handleLoadMore = useCallback(() => {
    fetchNotifications(page + 1, true);
  }, [fetchNotifications, page]);

  useEffect(() => {
    if (userId) {
      Promise.all([fetchNotifications(), fetchStats()]);
    }
  }, [userId, fetchNotifications, fetchStats]);

  const notificationGroups = useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications]
  );

  const unreadCount = useMemo(() => stats?.unread || 0, [stats]);

  const renderNotificationItem = useCallback(
    (notification: INotification) => {
      const taskId = notification.metadata?.taskId;
      const projectId = notification.metadata?.projectId;

      const handleClick = async () => {
        console.log("Notification click:", {
          taskId,
          projectId,
          metadata: notification.metadata,
          type: notification.type,
        });

        if (taskId && projectId) {
          try {
            await router.push(
              `/workspace/project-management/${projectId}/detail-task/${taskId}`
            );

            // Only mark as read if navigation is successful
            if (!notification.isRead) {
              try {
                await handleMarkAsRead(notification._id);
                setNotifications((prev) =>
                  prev.map((n) =>
                    n._id === notification._id ? { ...n, isRead: true } : n
                  )
                );
              } catch (error) {
                console.error("Failed to mark notification as read:", error);
              }
            }

            setDropdownOpen(false);
          } catch (error) {
            console.error("Navigation failed:", error);
            // Don't mark as read if navigation fails
          }
        } else {
          console.log("No taskId or projectId, notification marked as read");
          // Mark as read even if no navigation is needed
          if (!notification.isRead) {
            try {
              await handleMarkAsRead(notification._id);
              setNotifications((prev) =>
                prev.map((n) =>
                  n._id === notification._id ? { ...n, isRead: true } : n
                )
              );
            } catch (error) {
              console.error("Failed to mark notification as read:", error);
            }
          }

          setDropdownOpen(false);
        }
      };

      return (
        <div
          key={notification._id}
          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
            !notification.isRead ? "bg-blue-50" : "bg-white"
          }`}
          onClick={handleClick}
        >
          <div className="flex items-start gap-3">
            <Avatar
              src={
                typeof notification.senderId === "object" &&
                notification.senderId.avatar
                  ? notification.senderId.avatar
                  : undefined
              }
              style={{ backgroundColor: "#1890ff" }}
              size={32}
            >
              {getUserAvatar(notification.senderId)}
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Text className="text-sm font-medium text-gray-900">
                  {notification.title}
                </Text>
                <Text className="text-xs text-gray-500">
                  {formatTimeAgo(notification.createdAt)}
                </Text>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />
                )}
              </div>

              {/* Hiển thị tên task nếu có */}
              {notification.metadata?.taskName && (
                <div className="flex items-center gap-2 mb-2">
                  <CheckOutlined className="text-gray-400 text-xs" />
                  <Text className="text-sm text-gray-700">
                    {notification.metadata.taskName}
                  </Text>
                </div>
              )}

              {/* Hiển thị nội dung comment nếu có */}
              {notification.metadata?.commentText && (
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <Text className="text-sm text-gray-700">
                    {notification.metadata.commentText}
                  </Text>
                </div>
              )}

              {/* Hiển thị người gửi nếu có */}
              {typeof notification.senderId === "object" &&
                notification.senderId.fullname && (
                  <div className="mt-2">
                    <Text className="text-xs text-gray-500">
                      Gửi bởi: {notification.senderId.fullname}
                    </Text>
                  </div>
                )}

              {/* Hiển thị mention nếu có */}
              {notification.metadata?.mentionedUsers &&
                notification.metadata.mentionedUsers.length > 0 && (
                  <div className="mt-2">
                    <Text className="text-xs text-blue-600">
                      +{notification.metadata.mentionedUsers.length} mention
                      from {notification.title}
                    </Text>
                  </div>
                )}
            </div>
          </div>
        </div>
      );
    },
    [handleMarkAsRead, router]
  );

  const items = useMemo(
    () => [
      {
        key: "1",
        label: (
          <div
            className="w-[500px] max-h-[600px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between p-4">
                <Title level={5} className="mb-0">
                  Notifications
                  {!connected && (
                    <Text className="text-xs text-red-500 ml-2">(Offline)</Text>
                  )}
                </Title>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Text className="text-xs text-gray-600">
                      Only show unread
                    </Text>
                    <div onClick={handleSwitchClick}>
                      <Switch
                        size="small"
                        checked={showOnlyUnread}
                        onChange={handleToggleUnread}
                      />
                    </div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    className="text-gray-500 hover:text-blue-500"
                    title="Mark all as read"
                    onClick={handleMarkAllAsReadClick}
                  />
                </div>
              </div>

              <div className="px-4">
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={[
                    {
                      key: "direct",
                      label: "Direct",
                    },
                    {
                      key: "watching",
                      label: "Watching",
                    },
                  ]}
                  className="mb-0"
                  tabBarStyle={{ marginBottom: 0 }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === "direct" && (
                <div>
                  {loading && notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Spin size="large" />
                    </div>
                  ) : notifications.length > 0 ? (
                    <div>
                      {Object.entries(notificationGroups).map(
                        ([groupName, groupNotifications]) => (
                          <div key={groupName}>
                            <div className="px-4 py-2 bg-gray-50">
                              <Text className="text-xs font-medium text-gray-600">
                                {groupName}
                              </Text>
                            </div>
                            {groupNotifications.map(renderNotificationItem)}
                          </div>
                        )
                      )}

                      {hasMore && (
                        <div className="text-center py-4">
                          <Button
                            type="link"
                            onClick={handleLoadMore}
                            loading={loading}
                          >
                            Load more
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Text className="text-gray-500">
                        {showOnlyUnread
                          ? "No unread notifications"
                          : "No notifications"}
                      </Text>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "watching" && (
                <div className="text-center py-8">
                  <Text className="text-gray-500">
                    No watching notifications
                  </Text>
                </div>
              )}
            </div>
          </div>
        ),
      },
    ],
    [
      connected,
      showOnlyUnread,
      handleSwitchClick,
      handleToggleUnread,
      handleMarkAllAsReadClick,
      activeTab,
      loading,
      notifications.length,
      notificationGroups,
      renderNotificationItem,
      hasMore,
      handleLoadMore,
    ]
  );

  return (
    <Dropdown
      menu={{ items }}
      placement="bottomRight"
      trigger={["click"]}
      overlayClassName="notification-dropdown"
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      destroyOnHidden={false}
      getPopupContainer={(triggerNode) =>
        triggerNode.parentElement || document.body
      }
      autoAdjustOverflow={false}
    >
      <Badge count={unreadCount > 0 ? unreadCount : 0} offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined className="text-lg" />}
          className="text-gray-600 hover:text-gray-800"
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationPopup;
