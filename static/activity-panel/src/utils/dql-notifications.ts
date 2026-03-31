import type { DqlResult, DqlNotification, KnownNotificationType } from '../types/dql.ts';

interface NotificationMeta {
  title: string
  hint: string
}

const NOTIFICATION_HINTS: Record<KnownNotificationType, NotificationMeta> = {
  SCAN_LIMIT_GBYTES: {
    title: 'Scan Limit Reached',
    hint: 'Results are incomplete. Add the `scanLimitGBytes` parameter to your `fetch` command to raise or remove the limit (e.g. `fetch logs, scanLimitGBytes: -1`). Note: removing the limit may increase costs and query duration.',
  },
  BYTE_LIMIT_ADDED: {
    title: 'Result Byte Limit Reached',
    hint: 'The result was truncated because the maximum response size was reached. Narrow your query using filters, a shorter timeframe, or a `limit` clause to reduce the amount of returned data.',
  },
};

const KNOWN_TYPES = new Set<string>(Object.keys(NOTIFICATION_HINTS));

export function filterKnownNotifications(result: DqlResult): Array<DqlNotification & { meta: NotificationMeta }> {
  const notifications = result?.result?.metadata?.grail?.notifications as DqlNotification[] | undefined;
  if (!notifications?.length) {
    return [];
  }

  return notifications
    .filter((n: DqlNotification) => KNOWN_TYPES.has(n.notificationType))
    .map((n: DqlNotification) => ({
      ...n,
      meta: NOTIFICATION_HINTS[n.notificationType as KnownNotificationType],
    }));
}
