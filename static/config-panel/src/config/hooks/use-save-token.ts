import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@forge/bridge';

export const useSaveToken = (tokenInputRef, setSaveStatus) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token) => {
      return invoke('saveApiToken', { token });
    },
    onSuccess: (response: any) => {
      if (response && response.success) {
        setSaveStatus('Token saved successfully.');
        if (tokenInputRef.current) {
          tokenInputRef.current.value = '';
        }
        queryClient.setQueryData(['apiToken'], true);
      } else {
        setSaveStatus('Failed to save token1.');
      }
    },
    onError: () => {
      setSaveStatus('Failed to save token2.');
    }
  });
};
