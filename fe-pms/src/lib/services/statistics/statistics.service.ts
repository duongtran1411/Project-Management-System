import { Endpoints } from "@/lib/endpoints";
import axiosService from "../axios.service";
import { TaskStatistic } from "@/models/statistic/statistic.model";

export const getTaskStatistic = async (
  projectId: string
): Promise<TaskStatistic | null> => {
  const response = await axiosService
    .getAxiosInstance()
    .get(Endpoints.Statistics.STATISTIC_TASK(projectId));

  return response?.data || [];
};
