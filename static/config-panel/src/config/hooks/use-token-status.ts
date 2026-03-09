import { useQuery } from '@tanstack/react-query';
import { invoke } from '@forge/bridge';

export const useTenantConfigs = () => {
  return useQuery({
    queryKey: ['tenantConfigs'],
    queryFn: async () => {
      try {
        const res: any = await invoke('getTenantConfigs');
        return res.tenantConfigs || [];
      } catch (error) {
        console.error('Error fetching tenant configs:', error);
        return [];
      }
    },
    staleTime: 30000, // Data is considered fresh for 30 seconds
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  });
};
