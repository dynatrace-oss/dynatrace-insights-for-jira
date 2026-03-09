import { useMutation } from '@tanstack/react-query';
import { invoke } from '@forge/bridge';

export const useTestConnection = () => {
  return useMutation({
    mutationFn: ({ tenantId, query }: any) => {
      return invoke('testTenantConnection', { tenantId, query });
    }
  });
};
