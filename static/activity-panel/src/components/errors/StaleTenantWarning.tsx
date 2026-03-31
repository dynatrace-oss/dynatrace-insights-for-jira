import { AlertIcon } from '../../assets/icons/AlertIcon';
import type { TenantConfig } from '../../types/tenant';

interface StaleTenantWarningProps {
  tenants: TenantConfig[]
  staleTenantUrl?: string
  onSelect: (tenantId: string) => void
}

export function StaleTenantWarning({ tenants, staleTenantUrl, onSelect }: StaleTenantWarningProps) {
  const staleTenantDisplay = staleTenantUrl?.replace('https://', '');

  return (
    <div className="flex flex-col items-center gap-4 py-8 px-6 text-center">
      <AlertIcon className="text-amber-400 dark:text-amber-500" />

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tenant configuration used in this Jira ticket was removed
        </p>
        {staleTenantDisplay && (
          <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
            {staleTenantDisplay}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
          Select another available tenant from the options below.
          {' '}<strong className="text-gray-600 dark:text-gray-300">Note that data will be retrieved from the newly selected tenant.</strong>
        </p>
      </div>

      <ul className="w-full max-w-sm space-y-2">
        {tenants.map(tenant => (
          <li key={tenant.id}>
            <button
              onClick={() => onSelect(tenant.id)}
              className="w-full px-4 py-3 text-center text-sm font-medium rounded-md cursor-pointer
                border border-gray-200 dark:border-gray-700
                text-gray-700 dark:text-gray-300
                bg-gray-50 dark:bg-gray-800
                hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700
                dark:hover:bg-blue-900/30 dark:hover:border-blue-600 dark:hover:text-blue-300
                transition-colors"
            >
              {tenant.url.replace('https://', '')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
