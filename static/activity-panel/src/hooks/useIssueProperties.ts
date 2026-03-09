import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@forge/bridge';

interface UseIssuePropertiesOptions {
  issueId: string | undefined
  propertyName: string
}

interface UseIssuePropertiesResult<T> {
  properties: T | undefined
  isLoading: boolean
  error: Error | null
  saveProperties: (value: T) => Promise<void>
  isSaving: boolean
}

export function useIssueProperties<T extends Record<string, unknown>>({
  issueId,
  propertyName
}: UseIssuePropertiesOptions): UseIssuePropertiesResult<T> {
  const queryClient = useQueryClient();
  const queryKey = ['issueProperties', issueId, propertyName];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => {
      return invoke<T>('getIssueProperties', {
        issueId,
        propertyName
      });
    },
    enabled: Boolean(issueId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const mutation = useMutation({
    mutationFn: async (value: T) => {
      await invoke('saveIssueProperties', {
        issueId,
        propertyName,
        value
      });
      return value;
    },
    onSuccess: (savedData) => {
      queryClient.setQueryData(queryKey, savedData);
    }
  });

  const saveProperties = async (value: T): Promise<void> => {
    await mutation.mutateAsync(value);
  };

  return {
    properties: data,
    isLoading,
    error: error as Error | null,
    saveProperties,
    isSaving: mutation.isPending
  };
}
