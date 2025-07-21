import { showErrorToast } from "@/components/common/toast/toast";
import axiosService from "../axios.service";
import { Endpoints } from "@/lib/endpoints";

export const createComment = async (
  taskId: string,
  content: string,
  mentions?: string[],
  attachments?: File[]
) => {
  try {
    const formData = new FormData();
    formData.append("task", taskId);
    formData.append("content", content);
    if (mentions && mentions.length > 0) {
      mentions.forEach((m) => formData.append("mentions", m));
    }
    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => formData.append("files", file));
    }
    const response = await axiosService
      .getAxiosInstance()
      .post(`${Endpoints.Comment.CREATE_COMMENT}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    return response.data;
  } catch (error: any) {
    if (error) {
      showErrorToast(
        error.response?.data?.message || "Fail to create comment!"
      );
    }
    return null;
  }
};

// export const getComment = async (taskId: string) => {
//     try {
//         const response = await axiosService.getAxiosInstance().post(`${Endpoints.Comment.GET_COMMENT_BY_TASK}`)
//         return response.data
//     } catch (error: any) {
//         if (error) {
//             showErrorToast(error.response.data.message || "Fail to edit sprint!");
//         }
//     }
// }
