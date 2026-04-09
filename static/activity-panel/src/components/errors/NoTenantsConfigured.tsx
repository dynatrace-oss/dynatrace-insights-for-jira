import { AlertIcon } from '../../assets/icons/AlertIcon';
import { ExternalLinkIcon } from '../../assets/icons/ExternalLinkIcon';
import { openSettingsPage } from '../../utils/navigation';

export function NoTenantsConfigured() {
  const handleOpenSettings = () => openSettingsPage();

  return (
    <div className="flex flex-col items-center gap-3 py-8 px-6 text-center">
      <AlertIcon className="text-amber-400 dark:text-amber-500" />

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          No Dynatrace tenants configured
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
          To use this feature, Dynatrace tenants with API tokens need to be configured.
          Please contact your Jira Administrator to set up the required tenant configuration.
        </p>
      </div>

      <button
        onClick={handleOpenSettings}
        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer text-xs"
      >
        Go to configuration
        <ExternalLinkIcon />
      </button>
    </div>
  );
}
