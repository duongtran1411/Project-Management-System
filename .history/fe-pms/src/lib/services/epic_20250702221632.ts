import axiosService from "./axios.service";
import { Endpoints } from "../endpoints";

export const fetchEpicByProjectId = async (projectId: string) => {
  const { data } = await axiosService
    .getAxiosInstance()
    .get(Endpoints.Epic.GET_BY_PROJECT(projectId));
  return data;
};
