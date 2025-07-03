import axios from "./axios.service";
import { Endpoints } from "../endpoints";

export const fetchEpicByProjectId = async (projectId: string) => {
  const { data } = await axios.get(Endpoints.Epic.GET_BY_PROJECT(projectId));
  return data;
};
