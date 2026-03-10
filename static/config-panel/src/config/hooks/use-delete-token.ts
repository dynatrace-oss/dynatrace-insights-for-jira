import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@forge/bridge';

export const useDeleteToken = (setSaveStatus) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      return invoke('deleteApiToken');
    },
    onSuccess: (response: any) => {
      if (response.success) {
        setSaveStatus('Token deleted successfully.');
        queryClient.setQueryData(['apiToken'], false);
      } else {
        setSaveStatus('Failed to delete token.');
      }
    },
    onError: () => {
      setSaveStatus('Failed to delete token.');
    }
  });
};
