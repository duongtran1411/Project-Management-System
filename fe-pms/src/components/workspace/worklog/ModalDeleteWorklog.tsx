"use client";

import { deleteWorklog } from "@/lib/services/worklog/worklog.service";
import { WarningOutlined } from "@ant-design/icons";
import { Modal } from "antd";

interface Props {
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  setSelectedWorklogId: (id: string | null) => void;
  selectedWorklogId: string | null;
  mutateWorklog: () => void;
}

export const ModalDeleteWorklog: React.FC<Props> = ({
  showDeleteModal,
  setShowDeleteModal,
  setSelectedWorklogId,
  selectedWorklogId,
  mutateWorklog,
}) => {
  // Helper function to confirm delete
  const confirmDeleteWorklog = async () => {
    if (!selectedWorklogId) return;

    try {
      await deleteWorklog(selectedWorklogId);
      mutateWorklog();
      setShowDeleteModal(false);
      setSelectedWorklogId(null);
    } catch (error) {
      console.error("Error deleting worklog:", error);
    }
  };
  return (
    <Modal
      title={
        <span className="flex items-center gap-2">
          <WarningOutlined
            style={{
              color: "#ff4d4f",
            }}
          />
          Delete Worklog
        </span>
      }
      open={showDeleteModal}
      onOk={confirmDeleteWorklog}
      onCancel={() => {
        setShowDeleteModal(false);
        setSelectedWorklogId(null);
      }}
      okText="Delete"
      cancelText="Cancel"
      okButtonProps={{
        danger: true,
      }}
    >
      <p>
        Are you sure you want to delete this worklog entry? This action cannot
        be undone.
      </p>
    </Modal>
  );
};
