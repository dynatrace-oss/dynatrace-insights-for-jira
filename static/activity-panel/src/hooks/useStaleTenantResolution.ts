import { useEffect } from 'react';
import { useIssueConfig } from './useIssueConfig.tsx';
import { useTenantConfigs } from './useTenantConfigs.tsx';
export function useStaleTenantResolution() {
  const { config, isLoading, hasStaleTenant, saveConfig } = useIssueConfig();
  const { tenantConfigs } = useTenantConfigs();
  // When the URL still exists under a new ID, we can auto-remap silently
  const urlMatchedTenant = hasStaleTenant && config.tenantUrl
    ? (tenantConfigs.find(t => t.url === config.tenantUrl) ?? null)
    : null;
  useEffect(() => {
    if (!urlMatchedTenant) { return; }
    saveConfig({ ...config, selectedTenantId: urlMatchedTenant.id, tenantUrl: urlMatchedTenant.url });
  }, [urlMatchedTenant?.id]);
  const handleSelectTenant = async (tenantId: string) => {
    const tenant = tenantConfigs.find(t => t.id === tenantId);
    await saveConfig({ ...config, selectedTenantId: tenantId, tenantUrl: tenant?.url });
  };
  return {
    // Treat URL auto-resolve as still loading - the save is in-flight
    isLoading: isLoading || urlMatchedTenant !== null,
    // Only truly stale when there is no URL match to fall back on
    hasStaleTenant: hasStaleTenant && urlMatchedTenant === null,
    staleTenantUrl: config.tenantUrl,
    tenantConfigs,
    onSelectTenant: handleSelectTenant
  };
}
