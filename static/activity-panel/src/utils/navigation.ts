import { router, view } from '@forge/bridge';

const CONFIG_MODULE_KEY = 'dynatrace-insight-hub-config-panel';

export async function openSettingsPage(): Promise<void> {
  const context = await view.getContext();
  const envId = context.environmentId;
  const appId = context.localId.split('/')[1];
  router.open(`/jira/settings/apps/configure/${appId}/${envId}/static/${CONFIG_MODULE_KEY}/${envId}`);
}
