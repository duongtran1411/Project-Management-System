import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { Project } from "@/models/project/project.model";
import dayjs from "dayjs";

interface ModalConfirmRestoreProps {
  project: Project;
  open: boolean;
  onCancel: () => void;
  handleRestore: (projectId: string) => void;
  loading?: boolean;
}

const ModalConfirmRestore = ({
  project,
  open,
  onCancel,
  handleRestore,
  loading = false,
}: ModalConfirmRestoreProps) => {
  const showConfirm = () => {
    Modal.confirm({
      title: `Restore project "${project.name}"?`,
      icon: <ExclamationCircleFilled style={{ color: "#1890ff" }} />,
      content: (
        <div className="mt-4">
          <p>This will restore the project and all its contents.</p>
          {project.deletedAt && (
            <p className="mt-2 text-gray-500">
              Deleted on:{" "}
              {dayjs(project.deletedAt).format("MMM D, YYYY hh:mm A")}
            </p>
          )}
        </div>
      ),
      okText: "Restore",
      okButtonProps: {
        type: "primary",
        loading,
      },
      cancelText: "Cancel",
      onOk() {
        if (project._id) {
          handleRestore(project._id);
        }
      },
      onCancel,
      autoFocusButton: "cancel",
    });
  };

  return open ? <div style={{ display: "none" }}>{showConfirm()}</div> : null;
};

export default ModalConfirmRestore;
