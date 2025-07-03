import useSWR from 'swr';
import { fetchEpicByProjectId } from '@/lib/services/epic';

export const useEpicByProjectId = (projectId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? ['epics', projectId] : null,
    () => fetchEpicByProjectId(projectId)
  );

  return {
    epics: data,
    isLoading,
    isError: !!error,
 