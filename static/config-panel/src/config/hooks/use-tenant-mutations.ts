import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@forge/bridge';
import { useToast } from '../context/ToastContext.tsx';

export const useSaveTenant = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ tenantId, url, token }: any) => {
      // Normalize URL by removing trailing slashes
      const normalizedUrl = url.replace(/\/*$/, '');

      // Only pass token if it's not empty
      const payload = {
        tenantId,
        url: normalizedUrl,
        ...(token ? { token } : {})
      };
      return invoke('saveTenantConfig', payload);
    },
    onSuccess: (response: any, variables) => {
      if (response && response.success) {
        showToast('Tenant configuration saved successfully.');

        // Get current data from cache
        const currentData: any = queryClient.getQueryData(['tenantConfigs']) || [];

        // Find if tenant already exists
        const existingTenantIndex = currentData.findIndex(t => t.id === variables.tenantId);

        if (existingTenantIndex >= 0) {
          // Update existing tenant
          const updatedTenants = [...currentData];
          updatedTenants[existingTenantIndex] = {
            ...updatedTenants[existingTenantIndex],
            url: variables.url,
            hasToken: Boolean(variables.token) || updatedTenants[existingTenantIndex].hasToken
          };

          // Update cache
          queryClient.setQueryData(['tenantConfigs'], updatedTenants);
        } else {
          // Add new tenant
          const newTenant = {
            id: variables.tenantId,
            url: variables.url,
            hasToken: Boolean(variables.token)
          };

          // Update cache with new tenant added
          queryClient.setQueryData(['tenantConfigs'], [...currentData, newTenant]);
        }

        // Still invalidate the query to ensure eventual consistency, but with a delay
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tenantConfigs'] });
        }, 1000);
      } else {
        showToast('Failed to save tenant configuration.');
      }
    },
    onError: (error) => {
      showToast(`Failed to save tenant configuration: ${error.message || 'Unknown error'}`);
    }
  });
};

export const useDeleteTenantToken = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (tenantId) => {
      return invoke('deleteTenantToken', { tenantId });
    },
    onSuccess: (response: any, tenantId) => {
      if (response && response.success) {
        showToast('Token deleted successfully.');

        // Get current data from cache
        const currentData: any = queryClient.getQueryData(['tenantConfigs']) || [];

        // Update the tenant's hasToken status
        const updatedTenants = currentData.map(tenant =>
          tenant.id === tenantId ? { ...tenant, hasToken: false } : tenant
        );

        // Update cache
        queryClient.setQueryData(['tenantConfigs'], updatedTenants);

        // Still invalidate the query to ensure eventual consistency, but with a delay
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tenantConfigs'] });
        }, 1000);
      } else {
        showToast('Failed to delete token.');
      }
    },
    onError: () => {
      showToast('Failed to delete token.');
    }
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (tenantId) => {
      return invoke('deleteTenant', { tenantId });
    },
    onSuccess: (response: any, tenantId) => {
      if (response && response.success) {
        showToast('Tenant configuration deleted successfully.');

        // Get current data from cache
        const currentData: any = queryClient.getQueryData(['tenantConfigs']) || [];

        // Remove the tenant from the list
        const updatedTenants = currentData.filter(tenant => tenant.id !== tenantId);

        // Update cache
        queryClient.setQueryData(['tenantConfigs'], updatedTenants);

        // Still invalidate the query to ensure eventual consistency, but with a delay
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tenantConfigs'] });
        }, 1000);
      } else {
        showToast('Failed to delete tenant configuration.');
      }
    },
    onError: () => {
      showToast('Failed to delete tenant configuration.');
    }
  });
};
