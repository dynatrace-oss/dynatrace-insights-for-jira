import { useStaleTenantResolution } from '../hooks/useStaleTenantResolution.ts';
import { IssuePanel } from './IssuePanel.tsx';
import { StaleTenantWarning } from './errors/StaleTenantWarning.tsx';

export function IssuePanelContainer() {
  const { isLoading, hasStaleTenant, staleTenantUrl, tenantConfigs, onSelectTenant } = useStaleTenantResolution();

  if (isLoading) {
    return <div className="p-4 text-gray-800 dark:text-gray-200">Loading...</div>;
  }

  if (hasStaleTenant) {
    return <StaleTenantWarning tenants={tenantConfigs} staleTenantUrl={staleTenantUrl} onSelect={onSelectTenant} />;
  }

  return <IssuePanel />;
}
