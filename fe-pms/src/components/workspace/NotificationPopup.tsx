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
} from "@/models/notification/notification";
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
import React, { useEffect, useState, useCallback } from "react";

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

  useEffect(() => {
    const userId = getCurrentUserId();
    setUserId(userId);
  }, []);

  const handleToggleUnread = useCallback((checked: boolean) => {
    setShowOnlyUnread(checked);
    setDropdownOpen(true);
  }, []);

  const handleSwitchClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleMarkAllAsReadClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleMarkAllAsRead();
  }, []);

  const fetchNotifications = async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
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
  };

  const fetchStats = async () => {
    if (!userId) return;

    try {
      const response = await getNotificationStats(userId);
      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error("Failed to fetch notification stats:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      const updatedNotification = await markNotificationAsRead(
        notificationId,
        userId
      );
      if (updatedNotification) {
        // Refresh lại danh sách notifications để cập nhật UI
        await fetchNotifications();
        await fetchStats();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead();
      if (result) {
        // Refresh lại danh sách notifications để cập nhật UI
        await fetchNotifications();
        await fetchStats();
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchStats();
    }
  }, [userId, showOnlyUnread]);

  useEffect(() => {
    if (dropdownOpen) {
      const timer = setTimeout(() => {
        setDropdownOpen(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [notifications, stats]);

  const renderNotificationItem = (notification: INotification) => (
    <div
      key={notification._id}
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
        !notification.isRead ? "bg-blue-50" : "bg-white"
      }`}
      onClick={() => handleMarkAsRead(notification._id)}
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

          {notification.metadata?.taskName && (
            <div className="flex items-center gap-2 mb-2">
              <CheckOutlined className="text-gray-400 text-xs" />
              <Text className="text-sm text-gray-700">
                {notification.metadata.taskName}
              </Text>
            </div>
          )}

          {notification.metadata?.commentText && (
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <Text className="text-sm text-gray-700">
                {notification.metadata.commentText}
              </Text>
            </div>
          )}

          {notification.metadata?.mentionedUsers &&
            notification.metadata.mentionedUsers.length > 0 && (
              <div className="mt-2">
                <Text className="text-xs text-blue-600">
                  +{notification.metadata.mentionedUsers.length} mention from{" "}
                  {notification.title}
                </Text>
              </div>
            )}
        </div>
      </div>
    </div>
  );

  const notificationGroups = groupNotificationsByDate(notifications);

  const items = [
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
                          onClick={() => fetchNotifications(page + 1, true)}
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
                <Text className="text-gray-500">No watching notifications</Text>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  const unreadCount = stats?.unread || 0;

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
