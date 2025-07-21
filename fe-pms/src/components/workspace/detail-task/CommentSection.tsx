"use client";

import { useState } from "react";
import { Button, Input, Avatar } from "antd";
import { Comment } from "@/models/comment/comment";
import { ProjectContributorTag } from "@/models/projectcontributor/project.contributor.model";
import { createComment } from "@/lib/services/comment/comment.service";
import { showErrorToast } from "@/components/common/toast/toast";
import { Endpoints } from "@/lib/endpoints";
import { mutate } from "swr";
import { WorklogComponent } from "@/components/workspace/worklog/Worklog";
import History from "@/components/workspace/history/History";

interface CommentSectionProps {
  taskId: string;
  comments: Comment[];
  contributor: ProjectContributorTag[];
  onCommentAdded: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  taskId,
  comments,
  contributor,
  onCommentAdded,
}) => {
  const [newComment, setNewComment] = useState("");
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearchText, setMentionSearchText] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "comments" | "history" | "worklog"
  >("comments");

  // Function để xử lý input change và detect @
  const handleCommentInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setNewComment(value);
    setCursorPosition(e.target.selectionStart);

    // Detect @ để hiển thị dropdown
    const lastAtSymbol = value.lastIndexOf("@");
    if (lastAtSymbol !== -1 && lastAtSymbol < e.target.selectionStart) {
      const searchText = value.substring(
        lastAtSymbol + 1,
        e.target.selectionStart
      );
      setMentionSearchText(searchText);
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
    }
  };

  // Function để chọn user từ dropdown
  const selectMentionUser = (user: any) => {
    const lastAtSymbol = newComment.lastIndexOf("@");
    if (lastAtSymbol !== -1) {
      const beforeAt = newComment.substring(0, lastAtSymbol);
      const afterCursor = newComment.substring(cursorPosition);
      const newText =
        beforeAt + `@${user.userId?.fullName || "Unknown User"} ` + afterCursor;
      setNewComment(newText);

      // Thêm vào selected mentions
      setSelectedMentions((prev) =>
        prev.includes(user.userId?._id) ? prev : [...prev, user.userId?._id]
      );
    }
    setShowMentionDropdown(false);
    setMentionSearchText("");
  };

  // Filter users based on search text
  const filteredUsers = contributor.filter((user) =>
    user.userId?.fullName
      ?.toLowerCase()
      .includes(mentionSearchText.toLowerCase())
  );

  const handleComment = async () => {
    try {
      setIsCreatingComment(true);

      // Optimistic update - thêm comment ngay lập tức
      const optimisticComment = {
        _id: `temp-${Date.now()}`,
        content: newComment,
        task: taskId,
        author: {
          name: "You",
          avatar: "",
        },
        mentions: selectedMentions,
        attachments: attachments.map((file) => ({
          filename: file.name,
          url: URL.createObjectURL(file),
        })),
      };

      // Mutate với optimistic data
      mutate(
        `${Endpoints.Comment.GET_COMMENT_BY_TASK(taskId)}`,
        (currentComments: Comment[] = []) => [
          optimisticComment,
          ...currentComments,
        ],
        false // Không revalidate ngay
      );

      const response = await createComment(
        taskId,
        newComment,
        selectedMentions,
        attachments
      );

      if (response?.success) {
        setNewComment("");
        setSelectedMentions([]);
        setAttachments([]);

        // Revalidate để lấy data thật từ server
        mutate(`${Endpoints.Comment.GET_COMMENT_BY_TASK(taskId)}`);
        onCommentAdded();
      } else {
        // Nếu fail thì rollback optimistic update
        mutate(`${Endpoints.Comment.GET_COMMENT_BY_TASK(taskId)}`);
      }
    } catch (error: any) {
      // Rollback optimistic update nếu có lỗi
      mutate(`${Endpoints.Comment.GET_COMMENT_BY_TASK(taskId)}`);

      const errorMessage =
        error?.response?.data?.message || error?.message || "Đã xảy ra lỗi";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    } finally {
      setIsCreatingComment(false);
    }
  };

  return (
    <>
      {/* Activity (Comments) */}
      <div className="pt-4 border-t">
        <h3 className="mb-2 font-semibold text-md">Activity</h3>

        {/* Tabs */}
        <div className="flex mb-2 space-x-2">
          <Button
            size="small"
            type={activeTab === "all" ? "primary" : "default"}
            onClick={() => setActiveTab("all")}
          >
            All
          </Button>
          <Button
            size="small"
            type={activeTab === "comments" ? "primary" : "default"}
            onClick={() => setActiveTab("comments")}
          >
            Comments
          </Button>
          <Button
            size="small"
            type={activeTab === "history" ? "primary" : "default"}
            onClick={() => setActiveTab("history")}
          >
            History
          </Button>
          <Button
            size="small"
            type={activeTab === "worklog" ? "primary" : "default"}
            onClick={() => setActiveTab("worklog")}
          >
            Work log
          </Button>
        </div>

        {/* Comments */}
        {activeTab === "comments" && (
          <>
            {/* Comment Input */}
            <div className="mt-4 relative">
              {/* Loading overlay */}
              {isCreatingComment && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">
                      Creating comment...
                    </span>
                  </div>
                </div>
              )}

              {/* Add mentions quick select */}
              {Array.isArray(contributor) && contributor.length > 0 && (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">Add mentions:</span>
                  {contributor.map((e) => (
                    <Button
                      key={e._id}
                      size="small"
                      className="flex items-center max-w-32"
                      icon={
                        <Avatar
                          src={e.userId?.avatar}
                          size="small"
                          className="flex-shrink-0"
                        >
                          {e.userId?.fullName?.[0] || "?"}
                        </Avatar>
                      }
                      onClick={() => {
                        setSelectedMentions((prev) =>
                          prev.includes(e.userId?._id)
                            ? prev
                            : [...prev, e.userId?._id]
                        );
                        const mention = `@${
                          e.userId?.fullName || "Unknown User"
                        } `;
                        setNewComment((prev) => prev + mention);
                      }}
                    >
                      <span className="truncate">
                        {e.userId?.fullName || "Unknown User"}
                      </span>
                    </Button>
                  ))}
                </div>
              )}

              {/* Input file attachments */}
              <div className="mb-3">
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer">
                    <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <svg
                        className="w-5 h-5 text-gray-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        Attach files
                      </span>
                    </div>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files) {
                          setAttachments(Array.from(e.target.files));
                        }
                      }}
                    />
                  </label>
                  {attachments.length > 0 && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {attachments.length} file(s) selected
                    </span>
                  )}
                </div>

                {/* Preview selected files */}
                {attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-50 rounded-lg px-3 py-2 max-w-full"
                      >
                        <svg
                          className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm text-gray-700 truncate max-w-48">
                          {file.name}
                        </span>
                        <button
                          onClick={() =>
                            setAttachments(
                              attachments.filter((_, i) => i !== index)
                            )
                          }
                          className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Input.TextArea
                  value={newComment}
                  onChange={handleCommentInputChange}
                  placeholder="Add comment..."
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  className="resize-none"
                  disabled={isCreatingComment}
                />

                {showMentionDropdown && (
                  <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.userId?._id || "unknown"}
                          className="p-2 cursor-pointer hover:bg-gray-100 flex items-center"
                          onClick={() => selectMentionUser(user)}
                        >
                          <Avatar
                            src={user.userId?.avatar}
                            size="small"
                            className="flex-shrink-0"
                          />
                          <span className="ml-2 truncate">
                            {user.userId?.fullName || "Unknown User"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500">No users found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex mt-2 space-x-2">
                <Button
                  type="primary"
                  size="small"
                  onClick={handleComment}
                  disabled={!newComment.trim() || isCreatingComment}
                  loading={isCreatingComment}
                >
                  {isCreatingComment ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setNewComment("");
                    setSelectedMentions([]);
                    setAttachments([]);
                  }}
                  disabled={isCreatingComment}
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Render Comments */}
            <div className="mt-4 space-y-4">
              {Array.isArray(comments) &&
                comments.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Avatar
                      src={c.author.avatar}
                      className="rounded-full flex-shrink-0"
                      alt="avatar"
                      size="small"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1">
                        {c.author.name}
                      </p>

                      {/* Hiển thị attachment nếu có */}
                      {c.attachments &&
                        Array.isArray(c.attachments) &&
                        c.attachments.length > 0 && (
                          <div className="mt-2 mb-2">
                            {c.attachments.map((attachment, attIdx) => (
                              <div key={attIdx} className="mb-2">
                                {/* Kiểm tra nếu là ảnh */}
                                {attachment.filename &&
                                (attachment.filename
                                  .toLowerCase()
                                  .endsWith(".jpg") ||
                                  attachment.filename
                                    .toLowerCase()
                                    .endsWith(".jpeg") ||
                                  attachment.filename
                                    .toLowerCase()
                                    .endsWith(".png") ||
                                  attachment.filename
                                    .toLowerCase()
                                    .endsWith(".gif") ||
                                  attachment.filename
                                    .toLowerCase()
                                    .endsWith(".webp")) ? (
                                  <div className="inline-block">
                                    <img
                                      src={attachment.url}
                                      alt={attachment.filename}
                                      className="max-w-xs max-h-48 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                      onClick={() =>
                                        window.open(attachment.url, "_blank")
                                      }
                                    />
                                  </div>
                                ) : (
                                  /* Nếu không phải ảnh thì hiển thị link download */
                                  <div className="inline-flex items-center">
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                      <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                      </svg>
                                      {attachment.filename}
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Comment content với word-wrap */}
                      <div className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                        {c.content}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* History */}
        {activeTab === "history" && taskId && <History taskId={taskId} />}

        {/* Worklog */}
        {activeTab === "worklog" && (
          <WorklogComponent task={{ _id: taskId } as any} />
        )}
      </div>
    </>
  );
};
